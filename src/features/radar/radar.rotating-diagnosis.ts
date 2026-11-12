import type {
  Coordinator,
  RadarDiagnosis,
  RadarPayload,
  Store,
} from '../../types/radar'
import { formatCompactCurrency } from '../../utils/formatCurrency'
import { formatPercent } from '../../utils/formatPercent'
import {
  getPrioritiesByCoordinator,
  getStoresByCoordinator,
} from './radar.selectors'

export type DiagnosisSlotId =
  | 'daielly'
  | 'marielen'
  | 'maria-fernanda'
  | 'general'

export type RotatingDiagnosis = {
  id: DiagnosisSlotId
  label: string
  diagnosis: RadarDiagnosis
}

const SLOTS: ReadonlyArray<{
  id: DiagnosisSlotId
  label: string
}> = [
  { id: 'daielly', label: 'Daielly' },
  { id: 'marielen', label: 'Marielen' },
  { id: 'maria-fernanda', label: 'Maria Fernanda' },
  { id: 'general', label: 'Operação geral' },
]

function isValidProjection(coordinator: Coordinator): boolean {
  return (
    coordinator.monthGoal > 0 &&
    coordinator.monthProjectionPercent !== null &&
    Number.isFinite(coordinator.monthProjectionPercent) &&
    coordinator.monthProjectionGap !== null &&
    Number.isFinite(coordinator.monthProjectionGap)
  )
}

function monthlySituation(coordinator: Coordinator): string {
  if (!isValidProjection(coordinator)) {
    return 'projeção mensal indisponível'
  }

  const projected = formatPercent(coordinator.monthProjectionPercent!, 0)
  const deficit = coordinator.monthProjectionGap!

  return deficit < 0
    ? `projeção ${projected} e déficit previsto de ${formatCompactCurrency(-deficit)}`
    : `projeção ${projected} sem déficit projetado`
}

function priorityAction(data: RadarPayload, coordinator: Coordinator, stores: Store[]): string {
  if (stores.length === 0) {
    return 'Conferir a base de lojas desta coordenação.'
  }

  // Mantém a prioridade comercial já usada pelo motor: zeradas, conversão, gap.
  const scopedPriorities = getPrioritiesByCoordinator(data, coordinator.id)

  const zeroStore = stores
    .filter((store) => store.isZero)
    .sort((a, b) => b.dailyGoal - a.dailyGoal)[0]

  if (zeroStore) {
    const selected = scopedPriorities.find(
      (priority) =>
        priority.type === 'zero' &&
        priority.storeId === zeroStore.id,
    )

    return `Acionar ${selected?.title ?? zeroStore.name} para iniciar vendas.`
  }

  const conversionStore = stores
    .filter((store) =>
      !store.isZero &&
      store.pendingPayment > 0 &&
      store.dailyGap > 0,
    )
    .sort(
      (a, b) =>
        Math.min(b.pendingPayment, b.dailyGap) -
        Math.min(a.pendingPayment, a.dailyGap),
    )[0]

  if (conversionStore) {
    const value = Math.min(
      conversionStore.pendingPayment,
      conversionStore.dailyGap,
    )

    return `Converter até ${formatCompactCurrency(value)} em ${conversionStore.name}.`
  }

  const belowDaily = stores
    .filter((store) => store.dailyGap > 0)
    .sort((a, b) => b.dailyGap - a.dailyGap)[0]

  if (belowDaily) {
    return `Atuar no gap diário de ${formatCompactCurrency(belowDaily.dailyGap)} em ${belowDaily.name}.`
  }

  return 'Manter o acompanhamento das vendas e conversões.'
}

function coordinatorDiagnosis(
  data: RadarPayload,
  id: Exclude<DiagnosisSlotId, 'general'>,
  label: string,
): RadarDiagnosis {
  const coordinator = data.coordinators.find((item) => item.id === id)

  if (!coordinator) {
    return {
      status: 'attention',
      headline: `${label}:`,
      detail: 'dados da coordenação indisponíveis; conferir a origem antes de orientar ações.',
      generatedBy: 'deterministic',
    }
  }

  const stores = getStoresByCoordinator(data, coordinator.id)
  const zeroCount = stores.filter((store) => store.isZero).length
  const zeroSituation = stores.length > 0 && zeroCount > 0
    ? `; ${zeroCount} ${zeroCount === 1 ? 'loja sem vendas' : 'lojas sem vendas'}`
    : ''

  return {
    priorityCoordinatorId: coordinator.id,
    status: coordinator.monthProjectionPercent === null
      ? 'attention'
      : coordinator.status,
    headline: `${label}:`,
    detail: `${monthlySituation(coordinator)}${zeroSituation}. ${priorityAction(data, coordinator, stores)}`,
    generatedBy: 'deterministic',
  }
}

function generalDiagnosis(data: RadarPayload): RadarDiagnosis {
  const required = SLOTS.slice(0, 3).map((slot) =>
    data.coordinators.find((coordinator) => coordinator.id === slot.id),
  )

  const complete =
    required.every((coordinator) => coordinator && isValidProjection(coordinator)) &&
    data.summary.monthGoal > 0 &&
    data.summary.monthProjectionPercent !== null &&
    Number.isFinite(data.summary.monthProjectionPercent) &&
    data.summary.monthProjectionGap !== null &&
    Number.isFinite(data.summary.monthProjectionGap)

  if (!complete) {
    return {
      status: 'attention',
      headline: 'Operação geral:',
      detail: 'dados de projeção incompletos; conferir o fechamento das três coordenações.',
      generatedBy: 'deterministic',
    }
  }

  const coordinators = required as Coordinator[]
  const zeroCount = coordinators.reduce(
    (total, coordinator) => total + coordinator.zeroStores,
    0,
  )

  const projection = formatPercent(data.summary.monthProjectionPercent!, 0)
  const gap = data.summary.monthProjectionGap!
  const projectionSituation = gap < 0
    ? `projeção consolidada ${projection} e déficit previsto de ${formatCompactCurrency(-gap)}`
    : `projeção consolidada ${projection} sem déficit projetado`

  // O motor global existente já identifica o foco prioritário da operação.
  const engineFocus = data.coordinators.find(
    (coordinator) => coordinator.id === data.diagnosis.priorityCoordinatorId,
  )
  const mostAtRisk = coordinators.reduce(
    (worst, item) =>
      item.monthProjectionPercent! < worst.monthProjectionPercent!
        ? item
        : worst,
  )
  const focus = engineFocus ?? mostAtRisk

  const action = focus.monthProjectionPercent! < 90 || focus.zeroStores > 0
    ? `Priorizar ${focus.name} (${formatPercent(focus.monthProjectionPercent!, 0)}).`
    : 'Acompanhar as conversões nas três coordenações.'

  return {
    status: data.diagnosis.status,
    headline: 'Operação geral:',
    detail: `${projectionSituation}; ${zeroCount} ${zeroCount === 1 ? 'loja zerada' : 'lojas zeradas'} nas três coordenações. ${action}`,
    generatedBy: 'deterministic',
  }
}

/** A ordem é estável; a chegada de novos dados substitui apenas os textos. */
export function buildRotatingDiagnoses(data: RadarPayload): RotatingDiagnosis[] {
  return SLOTS.map(({ id, label }) => ({
    id,
    label,
    diagnosis: id === 'general'
      ? generalDiagnosis(data)
      : coordinatorDiagnosis(data, id, label),
  }))
}
