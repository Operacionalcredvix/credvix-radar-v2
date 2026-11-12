import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  server: { middlewareMode: true },
})

try {
  const [{ buildRotatingDiagnoses }, {
    diagnosisIndexAt, startDiagnosisRotation, DIAGNOSIS_DURATION_MS,
    DIAGNOSIS_CLOCK_POLL_MS,
  }, { getProjectionTone }, { adaptProductionApiToRadar }] = await Promise.all([
    server.ssrLoadModule('/src/features/radar/radar.rotating-diagnosis.ts'),
    server.ssrLoadModule('/src/features/radar/diagnosis.rotation.ts'),
    server.ssrLoadModule('/src/features/radar/radar.rules.ts'),
    server.ssrLoadModule('/src/services/radar.adapter.ts'),
  ])

  assert.equal(DIAGNOSIS_DURATION_MS, 20_000)
  assert.equal(DIAGNOSIS_CLOCK_POLL_MS, 1_000)


  // A cor da projeção deve considerar o percentual bruto, sem arredondar.
  const projectionCases = [
    { percent: 69.99, tone: 'critical', status: 'critical' },
    { percent: 70, tone: 'attention', status: 'attention' },
    { percent: 99.99, tone: 'attention', status: 'attention' },
    { percent: 100, tone: 'attention', status: 'attention' },
    { percent: 100.01, tone: 'positive', status: 'controlled' },
  ]

  for (const { percent, tone, status } of projectionCases) {
    assert.equal(getProjectionTone(percent), tone, `Raw projection at ${percent}%`)

    const coordinatorNames = ['DAIELLY', 'MARIELEN', 'MARIA FERNANDA']
    const monthProjectionAmount = percent * 10
    const api = {
      ok: true,
      date: '12/11/2026',
      updatedAt: '18h00',
      snapshot: { ok: true },
      responsiblePerformance: coordinatorNames.map((name) => ({
        name, paidToday: 100, soldToday: 100, dailyGoal: 100,
        monthGoal: 1_000, monthRealized: 100, monthProjectionPercent: percent,
        monthProjectionAmount, monthProjectionGap: monthProjectionAmount - 1_000,
      })),
      operationalStores: coordinatorNames.map((name) => ({
        name: `Loja ${name}`, responsible: name,
        paidToday: 100, soldToday: 100, dailyGoal: 100,
        monthProjectionPercent: percent, monthProjectionAmount,
        monthProjectionGap: monthProjectionAmount - 1_000,
      })),
    }

    const adapted = adaptProductionApiToRadar(api)
    assert.equal(adapted.summary.monthProjectionStatus.tone, tone, `General at ${percent}%`)
    assert.equal(adapted.coordinators.length, 3)
    assert.equal(adapted.stores.length, 3)
    for (const item of adapted.coordinators) {
      assert.equal(item.projectionTone, tone, `Coordinator ${item.name} at ${percent}%`)
      assert.equal(item.status, status)
    }
    for (const item of adapted.stores) {
      assert.equal(item.projectionTone, tone, `Store ${item.name} at ${percent}%`)
    }

    const general = buildRotatingDiagnoses(adapted)[3].diagnosis
    assert.equal(general.status, status, `General diagnosis at ${percent}%`)
    assert.match(general.detail, percent > 100
      ? /Acompanhar as conversões nas três coordenações/
      : /Priorizar/)
  }
  console.log('Projection thresholds: 69.99, 70, 99.99, 100, 100.01 across general, coordinators, stores and diagnosis OK')

  const coordinator = (id, name, projection, gap, zeroStores, status) => ({
    id, name, monthGoal: 500_000, monthProjectionPercent: projection,
    monthProjectionGap: gap, zeroStores,
    status,
  })

  const store = (id, coordinatorId, name, soldToday, dailyGap, pendingPayment, dailyGoal) => ({
    id, coordinatorId, name, soldToday, dailyGap, pendingPayment, dailyGoal,
    isZero: soldToday <= 0,
  })

  const original = {
    summary: {
      monthGoal: 1_500_000,
      monthProjectionPercent: 84,
      monthProjectionGap: -240_000,
    },
    coordinators: [
      coordinator('daielly', 'Daielly', 57, -220_000, 2, 'critical'),
      coordinator('marielen', 'Marielen', 106, 30_000, 1, 'attention'),
      coordinator('maria-fernanda', 'Maria Fernanda', 82, -50_000, 1, 'attention'),
    ],
    stores: [
      store('daielly-zero', 'daielly', 'Porto Seguro Centro', 0, 8_000, 0, 9_000),
      store('daielly-sale', 'daielly', 'Itabuna Centro', 3_000, 2_000, 1_500, 6_000),
      store('marielen-zero', 'marielen', 'Sao Mateus Centro', 0, 6_000, 0, 7_000),
      store('maria-sale', 'maria-fernanda', 'Brasilia Centro', 3_000, 2_000, 4_000, 8_000),
    ],
    priorities: [
      { id: 'zero-other', coordinatorId: 'marielen', storeId: 'marielen-zero', type: 'zero', title: 'Sao Mateus Centro' },
      { id: 'zero-daielly', coordinatorId: 'daielly', storeId: 'daielly-zero', type: 'zero', title: 'Porto Seguro Centro' },
    ],
    diagnosis: {
      priorityCoordinatorId: 'daielly',
      status: 'critical',
    },
  }

  let data = original
  const slots = buildRotatingDiagnoses(data)
  assert.deepEqual(slots.map((slot) => slot.id),
    ['daielly', 'marielen', 'maria-fernanda', 'general'])
  assert.deepEqual(slots.map((slot) => slot.label),
    ['Daielly', 'Marielen', 'Maria Fernanda', 'Operação geral'])

  for (const slot of slots) {
    assert.ok(slot.diagnosis.headline.startsWith(slot.label + ':'))
    assert.equal(slot.diagnosis.generatedBy, 'deterministic')
  }

  assert.match(slots[0].diagnosis.detail, /57%/)
  assert.match(slots[0].diagnosis.detail, /déficit previsto/)
  assert.match(slots[0].diagnosis.detail, /Porto Seguro Centro/)
  assert.doesNotMatch(slots[0].diagnosis.detail, /Sao Mateus|Brasilia Centro/)
  assert.match(slots[1].diagnosis.detail, /106%/)
  assert.match(slots[1].diagnosis.detail, /Sao Mateus Centro/)
  assert.doesNotMatch(slots[1].diagnosis.detail, /Porto Seguro|Brasilia Centro/)
  assert.match(slots[2].diagnosis.detail, /82%/)
  assert.match(slots[2].diagnosis.detail, /Converter até/)
  assert.match(slots[2].diagnosis.detail, /Brasilia Centro/)
  assert.doesNotMatch(slots[2].diagnosis.detail, /Porto Seguro|Sao Mateus/)
  assert.match(slots[3].diagnosis.detail, /84%/)
  assert.match(slots[3].diagnosis.detail, /R\$ 240,0 mil/)
  assert.match(slots[3].diagnosis.detail, /4 lojas zeradas/)
  assert.match(slots[3].diagnosis.detail, /Daielly/)

  const missing = {
    ...original,
    coordinators: original.coordinators.filter((item) => item.id !== 'marielen')
      .map((item) => item.id === 'daielly'
        ? { ...item, monthProjectionPercent: null, monthProjectionGap: null }
        : item),
    summary: { ...original.summary, monthProjectionPercent: null },
  }

  const missingSlots = buildRotatingDiagnoses(missing)
  assert.match(missingSlots[0].diagnosis.detail, /projeção mensal indisponível/)
  assert.doesNotMatch(missingSlots[0].diagnosis.detail, /projeção 0%/)
  assert.match(missingSlots[1].diagnosis.detail, /dados da coordenação indisponíveis/)
  assert.match(missingSlots[3].diagnosis.detail, /dados de projeção incompletos/)
  assert.doesNotMatch(missingSlots[1].diagnosis.detail, /Porto Seguro/)

  // Relógio simulado: nenhum timer real nem espera de 80 segundos.
  let nowMs = 0
  let scheduleCalls = 0
  let cancelCalls = 0
  let scheduledCallback
  let intervalMs = 0
  let current = 0
  const transitions = []

  const rotation = startDiagnosisRotation((index) => {
    current = index
    transitions.push({ index, label: buildRotatingDiagnoses(data)[index].label, at: nowMs })
  }, {
    now: () => nowMs,
    schedule: (callback, duration) => {
      scheduleCalls++
      scheduledCallback = callback
      intervalMs = duration
      return 42
    },
    cancel: (id) => {
      assert.equal(id, 42)
      cancelCalls++
    },
  })

  assert.equal(scheduleCalls, 1)
  assert.equal(intervalMs, 1_000)

  const checkAt = (ms, expectedSlot) => {
    nowMs = ms
    scheduledCallback()
    assert.equal(current, expectedSlot, 'Slot at ' + ms)
    assert.equal(diagnosisIndexAt(ms, 0), expectedSlot)
  }

  checkAt(0, 0)
  checkAt(19_999, 0)
  checkAt(20_000, 1)
  checkAt(39_999, 1)

  // Atualizar os dados no meio do slot não deve criar novo intervalo.
  data = {
    ...original,
    coordinators: original.coordinators.map((item) =>
      item.id === 'marielen'
        ? { ...item, monthProjectionPercent: 97, monthProjectionGap: -10_000 }
        : item),
  }
  assert.match(buildRotatingDiagnoses(data)[1].diagnosis.detail, /97%/)
  assert.equal(current, 1)
  assert.equal(scheduleCalls, 1)

  checkAt(40_000, 2)
  checkAt(59_999, 2)
  checkAt(60_000, 3)
  checkAt(79_999, 3)
  checkAt(80_000, 0)
  assert.deepEqual(transitions.map(({ index }) => index), [1, 2, 3, 0])
  assert.deepEqual(transitions.map(({ label }) => label),
    ['Marielen', 'Maria Fernanda', 'Operação geral', 'Daielly'])

  // A callback pode atrasar em uma TV: recalcula a posição por tempo real.
  nowMs = 5 * 60_000
  rotation.check()
  assert.equal(current, diagnosisIndexAt(nowMs, 0))

  rotation.dispose()
  rotation.dispose()
  assert.equal(cancelCalls, 1)
  const beforeDispose = transitions.length
  nowMs += 20_000
  scheduledCallback()
  rotation.check()
  assert.equal(transitions.length, beforeDispose)
  console.log('Diagnosis rotation: sequence 20/40/60/80s, fresh data, resume and cleanup OK')
} finally {
  await server.close()
}
