import type { RadarPayload } from '../types/radar'

export const radarMock: RadarPayload = {
  ok: true,

  contract: {
    name: 'credvix.radar-operacao-comercial',
    version: '1.0.0',
  },

  source: {
    baseDate: '2026-10-08',
    updatedAt: '2026-10-08T16:01:00-03:00',
    generatedAt: '2026-10-08T16:01:05-03:00',
    provider: 'google-sheets',
  },

  summary: {
    totalStores: 33,

    soldTodayAchievementPercent: 72,

    soldTodayStatus: {
      label: 'Próxima da meta',
      tone: 'attention',
    },

    monthProjectionStatus: {
      label: 'Abaixo da meta',
      tone: 'attention',
    },

    paidToday: 64923.25,
    soldToday: 88245.03,
    pendingPayment: 23321.78,

    pace: {
      actualPercent: 52.53,
      expectedPercent: 58,
      differencePercent: -5.47,
    },

    cycle: {
      remainingMinutes: 422,
    },

    dailyGoal: 123591.53,
    dailyGap: 58668.28,
    newSalesNeeded: 35346.5,
    dailyAchievementPercent: 52.53,

    monthGoal: 3600000,
    monthRealized: 108000,
    monthAchievementPercent: 3,

    monthProjectionPercent: 61,
    monthProjectionAmount: 2196000,
    monthProjectionGap: -1404000,
  },

  coordinators: [
    {
      id: 'daielly',
      name: 'Daielly',

      rankingPosition: 3,

      status: 'critical',

      statusReason:
        'Projeção mensal crítica e lojas zeradas.',

      projectionTone: 'critical',

      monthProjectionPercent: 52,
      monthProjectionAmount: 624000,
      monthProjectionGap: -576000,

      paidToday: 16737,
      soldToday: 25000,
      pendingPayment: 8263,

      dailyGoal: 39012,
      dailyGap: 22275,
      dailyAchievementPercent: 42.9,

      monthGoal: 1200000,
      monthRealized: 36000,
      monthAchievementPercent: 3,

      zeroStores: 2,
      storeCount: 12,
    },

    {
      id: 'maria-fernanda',
      name: 'Maria Fernanda',

      rankingPosition: 2,

      status: 'attention',

      statusReason:
        'Projeção mensal crítica e lojas zeradas.',

      projectionTone: 'attention',

      monthProjectionPercent: 70,
      monthProjectionAmount: 543000,
      monthProjectionGap: -376000,

      paidToday: 24500,
      soldToday: 31245.03,
      pendingPayment: 6745.03,

      dailyGoal: 42000,
      dailyGap: 17500,
      dailyAchievementPercent: 58.33,

      monthGoal: 1250000,
      monthRealized: 40000,
      monthAchievementPercent: 3.2,

      zeroStores: 1,
      storeCount: 11,
    },

    {
      id: 'marielen',
      name: 'Marielen',

      rankingPosition: 1,

      status: 'controlled',
      statusReason:
        'Projeção mensal crítica e lojas zeradas.',

      projectionTone: 'positive',

      monthProjectionPercent: 64,
      monthProjectionAmount: 484000,
      monthProjectionGap: -576000,

      paidToday: 23686.25,
      soldToday: 32000,
      pendingPayment: 8313.75,

      dailyGoal: 42579.53,
      dailyGap: 18893.28,
      dailyAchievementPercent: 55.63,

      monthGoal: 1150000,
      monthRealized: 32000,
      monthAchievementPercent: 2.78,

      zeroStores: 1,
      storeCount: 10,
    },
  ],

  stores: [
    {
      id: 'cariacica',
      name: 'Cariacica Campo Grande',
      coordinatorId: 'daielly',

      paidToday: 0,
      soldToday: 0,
      pendingPayment: 0,

      dailyGoal: 8500,
      dailyGap: 8500,
      dailyAchievementPercent: 0,

      isZero: true,
    },

    {
      id: 'colatina',
      name: 'Colatina Centro',
      coordinatorId: 'daielly',

      paidToday: 3500,
      soldToday: 7200,
      pendingPayment: 3700,

      dailyGoal: 6500,
      dailyGap: 3000,
      dailyAchievementPercent: 53.85,

      isZero: false,
    },

    {
      id: 'vila-velha',
      name: 'Vila Velha Centro',
      coordinatorId: 'maria-fernanda',

      paidToday: 7800,
      soldToday: 9100,
      pendingPayment: 1300,

      dailyGoal: 8000,
      dailyGap: 200,
      dailyAchievementPercent: 97.5,
      isZero: false,
    },

    {
      id: 'sao-mateus',
      name: 'São Mateus',
      coordinatorId: 'marielen',

      paidToday: 0,
      soldToday: 0,
      pendingPayment: 0,

      dailyGoal: 7200,
      dailyGap: 7200,
      dailyAchievementPercent: 0,
      isZero: true,
    },
  ],

  priorities: [
    {
      id: 'priority-sao-mateus',

      position: 1,

      type: 'zero',
      severity: 'critical',

      coordinatorId: 'daielly',
      storeId: 'sao-mateus',

      title: 'São Mateus - Centro',
      detail: 'Zerada - Acionar carteira',

      recoverableGap: 3429,
    },

    {
      id: 'priority-serra',

      position: 2,

      type: 'zero',
      severity: 'critical',

      coordinatorId: 'marielen',
      storeId: 'serra-laranjeiras',

      title: 'Serra Laranjeiras II',
      detail: 'Zerada - Acionar carteira',

      recoverableGap: 2729,
    },

    {
      id: 'priority-cuiaba',

      position: 3,
      type: 'zero',
      severity: 'high',

      coordinatorId: 'maria-fernanda',
      storeId: 'cuiaba-centro-norte',

      title: 'Cuiabá - Centro Norte',
      detail: 'Zerada - Acionar carteira',

      recoverableGap: 2710,
    },

    {
      id: 'priority-vitoria',

      position: 4,
      type: 'conversion',
      severity: 'medium',

      coordinatorId: 'marielen',
      storeId: 'vitoria-praia-do-canto',

      title: 'Vitória - Praia do Canto',
      detail: 'Conversão - Converter R$ 5,2 mil',

      recoverableGap: 1805,
    },

    {
      id: 'priority-colatina',

      position: 5,
      type: 'conversion',
      severity: 'medium',

      coordinatorId: 'daielly',
      storeId: 'colatina',

      title: 'Colatina - Centro',
      detail: 'Conversão - Converter R$ 1,4 mil',

      recoverableGap: 1380,
    },
  ],

  priorityPanel: {
    headline: 'Conversão é o foco da operação',
    recoverableTotal: 12121,
  },

  diagnosis: {
    priorityCoordinatorId: 'daielly',

    status: 'critical',

    headline: 'Daielly em situação crítica:',

    detail:
      'projeção de 52% e 12,2% realizado no mês. Intervir em São Mateus, Centro e Colatina Centro libera R$ 4,8 mil de liquidez direta.',

    generatedBy: 'deterministic',
  },

  quality: {
    status: 'ok',
    warnings: [],
    missingFields: [],
    sourceAgeMinutes: 0,
  },
}