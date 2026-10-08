import type {
  Coordinator,
  GoalIndicator,
  GoalTone,
  RadarPayload,
  RadarPriority,
  RadarStatus,
  Store,
} from '../types/radar'

import { formatCompactCurrency } from '../utils/formatCurrency'
import { formatPercent } from '../utils/formatPercent'

type ApiCoordinator = {
  name?: string

  paidToday?: number
  soldToday?: number
  conversionPending?: number

  dailyGoal?: number
  dailyGap?: number
  dailyPercent?: number

  monthGoal?: number
  monthRealized?: number
  monthAchievedPercent?: number

  monthPercent?: number
  monthProjectionPercent?: number | null
  monthProjectionAmount?: number | null
  monthProjectionGap?: number | null

  zeroCount?: number
  storeCount?: number

  status?: string
  risk?: string
  priority?: string
  diagnosis?: string
}

type ApiStore = {
  name?: string
  responsible?: string

  dailyGoal?: number

  soldToday?: number
  paidToday?: number

  conversionPending?: number
}

export type ProductionApiPayload = {
  ok: boolean

  error?: string
  message?: string

  updatedAt?: string
  date?: string

  responsiblePerformance?: ApiCoordinator[]
  operationalStores?: ApiStore[]

  missingData?: string[]
  warning?: string
}

const COORDINATOR_NAMES = [
  'DAIELLY',
  'MARIA FERNANDA',
  'MARIELEN',
] as const

const PROJECTION_CRITICAL = 70
const PROJECTION_POSITIVE = 90

const DAILY_CRITICAL = 35
const DAILY_ATTENTION = 80

type PriorityCandidate = {
  id: string

  type: RadarPriority['type']

  coordinatorId: string
  storeId?: string

  title: string
  detail: string

  recoverableGap: number
}

function normalize(value?: string) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
}

function toId(value?: string) {
  return normalize(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function number(value: unknown) {
  const parsed = Number(value)

  return Number.isFinite(parsed)
    ? parsed
    : 0
}

function nullableNumber(
  value: unknown,
): number | null {
  const parsed = Number(value)

  return Number.isFinite(parsed)
    ? parsed
    : null
}

function percentage(
  value: number,
  total: number,
) {
  if (total <= 0) {
    return 0
  }

  return (value / total) * 100
}

function coordinatorStatus(
  projection: number,
  zeroStores: number,
  dailyPercent: number,
): RadarStatus {
  if (
    projection < PROJECTION_CRITICAL ||
    zeroStores >= 3 ||
    dailyPercent < DAILY_CRITICAL
  ) {
    return 'critical'
  }

  if (
    projection < PROJECTION_POSITIVE ||
    zeroStores > 0 ||
    dailyPercent < DAILY_ATTENTION
  ) {
    return 'attention'
  }

  return 'controlled'
}

function coordinatorReason(
  projection: number,
  zeroStores: number,
  dailyPercent: number,
) {
  if (projection < PROJECTION_CRITICAL) {
    return 'Projeção mensal crítica'
  }

  if (zeroStores >= 3) {
    return `${zeroStores} lojas zeradas`
  }

  if (dailyPercent < DAILY_CRITICAL) {
    return 'Ritmo diário crítico'
  }

  if (projection < PROJECTION_POSITIVE) {
    return 'Projeção abaixo do ideal'
  }

  if (zeroStores > 0) {
    return `${zeroStores} ${zeroStores === 1
        ? 'loja zerada'
        : 'lojas zeradas'
      }`
  }

  if (dailyPercent < DAILY_ATTENTION) {
    return 'Diária exige acompanhamento'
  }

  return 'Operação controlada'
}

function projectionTone(
  projection: number,
): GoalTone {
  if (projection >= PROJECTION_POSITIVE) {
    return 'positive'
  }

  if (projection >= PROJECTION_CRITICAL) {
    return 'attention'
  }

  return 'critical'
}

function soldTodayIndicator(
  percent: number,
): GoalIndicator {
  if (percent >= 100) {
    return {
      label: 'Meta entregue',
      tone: 'positive',
    }
  }

  if (percent >= 70) {
    return {
      label: 'Próxima da meta',
      tone: 'attention',
    }
  }

  return {
    label: 'Abaixo da meta',
    tone: 'critical',
  }
}

function projectionIndicator(
  percent: number,
): GoalIndicator {
  if (percent >= 100) {
    return {
      label: 'Meta projetada',
      tone: 'positive',
    }
  }

  if (percent >= PROJECTION_CRITICAL) {
    return {
      label: 'Abaixo da meta',
      tone: 'attention',
    }
  }

  return {
    label: 'Abaixo da meta',
    tone: 'critical',
  }
}

function buildBaseDate(value?: string) {
  const match = String(value ?? '').match(
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
  )

  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`
  }

  const parts =
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date())

  const year =
    parts.find(
      (part) => part.type === 'year',
    )?.value ?? '1970'

  const month =
    parts.find(
      (part) => part.type === 'month',
    )?.value ?? '01'

  const day =
    parts.find(
      (part) => part.type === 'day',
    )?.value ?? '01'

  return `${year}-${month}-${day}`
}

function buildUpdatedAt(
  baseDate: string,
  value?: string,
) {
  const match = String(value ?? '').match(
    /(\d{1,2})[h:](\d{2})/,
  )

  if (!match) {
    return `${baseDate}T00:00:00-03:00`
  }

  const hour =
    String(Number(match[1])).padStart(2, '0')

  return `${baseDate}T${hour}:${match[2]}:00-03:00`
}

function sourceAgeMinutes(
  updatedAt: string,
) {
  const timestamp = Date.parse(updatedAt)

  if (!Number.isFinite(timestamp)) {
    return null
  }

  return Math.max(
    0,
    Math.floor(
      (Date.now() - timestamp) / 60_000,
    ),
  )
}

function buildStores(
  apiStores: ApiStore[],
): Store[] {
  const allowed =
    new Set<string>(COORDINATOR_NAMES)

  return apiStores
    .filter((store) =>
      allowed.has(
        normalize(store.responsible),
      ),
    )
    .map((store) => {
      const soldToday =
        number(store.soldToday)

      const paidToday =
        number(store.paidToday)

      const dailyGoal =
        number(store.dailyGoal)

      const pendingPayment =
        nullableNumber(
          store.conversionPending,
        ) ??
        Math.max(
          0,
          soldToday - paidToday,
        )

      const dailyGap =
        Math.max(
          0,
          dailyGoal - paidToday,
        )

      const coordinatorId =
        toId(store.responsible)

      const name =
        store.name?.trim() || 'Loja'

      return {
        id: toId(
          `${coordinatorId}-${name}`,
        ),

        name,
        coordinatorId,

        paidToday,
        soldToday,
        pendingPayment,

        dailyGoal,
        dailyGap,

        dailyAchievementPercent:
          percentage(
            paidToday,
            dailyGoal,
          ),

        // Zerada = sem venda no dia.
        isZero: soldToday <= 0,
      }
    })
}

function buildCoordinators(
  apiRows: ApiCoordinator[],
  stores: Store[],
): Coordinator[] {
  const selected =
    COORDINATOR_NAMES
      .map((expectedName) =>
        apiRows.find(
          (row) =>
            normalize(row.name) ===
            expectedName,
        ),
      )
      .filter(
        (
          row,
        ): row is ApiCoordinator =>
          Boolean(row),
      )

  const coordinators =
    selected.map((row) => {
      const id = toId(row.name)

      const coordinatorStores =
        stores.filter(
          (store) =>
            store.coordinatorId === id,
        )

      const paidToday =
        number(row.paidToday)

      const soldToday =
        number(row.soldToday)

      const pendingPayment =
        nullableNumber(
          row.conversionPending,
        ) ??
        Math.max(
          0,
          soldToday - paidToday,
        )

      const dailyGoal =
        number(row.dailyGoal)

      const dailyGap =
        Math.max(
          0,
          dailyGoal - paidToday,
        )

      const dailyAchievementPercent =
        percentage(
          paidToday,
          dailyGoal,
        )

      const monthGoal =
        number(row.monthGoal)

      const monthRealized =
        number(row.monthRealized)

      const monthAchievementPercent =
        percentage(
          monthRealized,
          monthGoal,
        )

      const monthProjectionPercent =
        number(
          row.monthProjectionPercent ??
          row.monthPercent,
        )

      const monthProjectionAmount =
        nullableNumber(
          row.monthProjectionAmount,
        ) ??
        (
          monthGoal *
          monthProjectionPercent
        ) /
        100

      const monthProjectionGap =
        nullableNumber(
          row.monthProjectionGap,
        ) ??
        (
          monthProjectionAmount -
          monthGoal
        )

      const zeroStores =
        coordinatorStores.length
          ? coordinatorStores.filter(
            (store) => store.isZero,
          ).length
          : number(row.zeroCount)

      const storeCount =
        coordinatorStores.length ||
        number(row.storeCount)

      const status =
        coordinatorStatus(
          monthProjectionPercent,
          zeroStores,
          dailyAchievementPercent,
        )

      return {
        id,

        name:
          row.name?.trim() ??
          'Coordenação',

        rankingPosition: 0,

        status,

        statusReason:
          coordinatorReason(
            monthProjectionPercent,
            zeroStores,
            dailyAchievementPercent,
          ),

        projectionTone:
          projectionTone(
            monthProjectionPercent,
          ),

        paidToday,
        soldToday,
        pendingPayment,

        dailyGoal,
        dailyGap,
        dailyAchievementPercent,

        monthGoal,
        monthRealized,
        monthAchievementPercent,

        monthProjectionPercent,
        monthProjectionAmount,
        monthProjectionGap,

        zeroStores,
        storeCount,
      }
    })

  return [...coordinators]
    .sort(
      (a, b) =>
        b.dailyAchievementPercent -
        a.dailyAchievementPercent,
    )
    .map(
      (coordinator, index) => ({
        ...coordinator,
        rankingPosition: index + 1,
      }),
    )
}

function buildPriorities(
  stores: Store[],
): RadarPriority[] {
  const zero: PriorityCandidate[] =
    stores
      .filter((store) => store.isZero)
      .sort(
        (a, b) =>
          b.dailyGoal - a.dailyGoal,
      )
      .map((store) => ({
        id: `priority-zero-${store.id}`,

        type: 'zero',

        coordinatorId:
          store.coordinatorId,

        storeId: store.id,

        title: store.name,

        detail:
          'Zerada - Acionar carteira',

        recoverableGap:
          store.dailyGoal,
      }))

  const conversion: PriorityCandidate[] =
    stores
      .filter(
        (store) =>
          !store.isZero &&
          store.pendingPayment > 0 &&
          store.dailyGap > 0,
      )
      .map((store) => ({
        store,

        recoverableGap:
          Math.min(
            store.pendingPayment,
            store.dailyGap,
          ),
      }))
      .sort(
        (a, b) =>
          b.recoverableGap -
          a.recoverableGap,
      )
      .map(
        ({
          store,
          recoverableGap,
        }) => ({
          id:
            `priority-conversion-${store.id}`,

          type: 'conversion',

          coordinatorId:
            store.coordinatorId,

          storeId: store.id,

          title: store.name,

          detail:
            'Conversão - Converter vendido em pago',

          recoverableGap,
        }),
      )

  const belowDaily: PriorityCandidate[] =
    stores
      .filter(
        (store) =>
          !store.isZero &&
          store.pendingPayment <= 0 &&
          store.dailyGap > 0,
      )
      .sort(
        (a, b) =>
          b.dailyGap - a.dailyGap,
      )
      .map((store) => ({
        id:
          `priority-gap-${store.id}`,

        type: 'below-daily',

        coordinatorId:
          store.coordinatorId,

        storeId: store.id,

        title: store.name,

        detail:
          'Abaixo da diária - Recuperar produção',

        recoverableGap:
          store.dailyGap,
      }))

  return [
    ...zero,
    ...conversion,
    ...belowDaily,
  ]
    .slice(0, 5)
    .map(
      (
        priority,
        index,
      ): RadarPriority => ({
        ...priority,

        position: index + 1,

        severity:
          index <= 1
            ? 'critical'
            : index === 2
              ? 'high'
              : 'medium',
      }),
    )
}

function coordinatorRiskScore(
  coordinator: Coordinator,
) {
  return (
    Math.max(
      0,
      100 -
      coordinator.monthProjectionPercent,
    ) *
    10 +
    coordinator.zeroStores * 120 +
    Math.max(
      0,
      100 -
      coordinator.dailyAchievementPercent,
    )
  )
}

function buildDiagnosis(
  coordinators: Coordinator[],
  priorities: RadarPriority[],
) {
  const risk =
    [...coordinators].sort(
      (a, b) =>
        coordinatorRiskScore(b) -
        coordinatorRiskScore(a),
    )[0]

  if (!risk) {
    return {
      status: 'attention' as const,

      headline:
        'Dados insuficientes:',

      detail:
        'não foi possível identificar a coordenação prioritária.',

      generatedBy:
        'deterministic' as const,
    }
  }

  const related =
    priorities
      .filter(
        (priority) =>
          priority.coordinatorId ===
          risk.id,
      )
      .slice(0, 2)

  const recoverable =
    related.reduce(
      (sum, priority) =>
        sum +
        priority.recoverableGap,
      0,
    )

  const action =
    related.length > 0
      ? ` Atuar primeiro em ${related
        .map(
          (priority) =>
            priority.title,
        )
        .join(
          ' e ',
        )} representa ${formatCompactCurrency(
          recoverable,
        )} de gap recuperável.`
      : ' Reforçar o acompanhamento das lojas abaixo da diária.'

  return {
    priorityCoordinatorId:
      risk.id,

    status: risk.status,

    headline:
      `${risk.name} exige maior atenção:`,

    detail:
      `projeção de ${formatPercent(
        risk.monthProjectionPercent,
        1,
      )}, ${formatPercent(
        risk.monthAchievementPercent,
        1,
      )} realizado no mês e ${risk.zeroStores} ${risk.zeroStores === 1
        ? 'loja zerada'
        : 'lojas zeradas'
      }.${action}`,

    generatedBy:
      'deterministic' as const,
  }
}

export function adaptProductionApiToRadar(
  api: ProductionApiPayload,
): RadarPayload {
  const apiRows =
    api.responsiblePerformance ?? []

  const stores =
    buildStores(
      api.operationalStores ?? [],
    )

  const coordinators =
    buildCoordinators(
      apiRows,
      stores,
    )

  if (!coordinators.length) {
    throw new Error(
      'A API não retornou as coordenações do Radar.',
    )
  }

  const paidToday =
    coordinators.reduce(
      (sum, item) =>
        sum + item.paidToday,
      0,
    )

  const soldToday =
    coordinators.reduce(
      (sum, item) =>
        sum + item.soldToday,
      0,
    )

  const pendingPayment =
    coordinators.reduce(
      (sum, item) =>
        sum +
        item.pendingPayment,
      0,
    )

  const dailyGoal =
    coordinators.reduce(
      (sum, item) =>
        sum + item.dailyGoal,
      0,
    )

  const dailyGap =
    Math.max(
      0,
      dailyGoal - paidToday,
    )

  const newSalesNeeded =
    Math.max(
      0,
      dailyGoal - soldToday,
    )

  const dailyAchievementPercent =
    percentage(
      paidToday,
      dailyGoal,
    )

  const soldTodayAchievementPercent =
    percentage(
      soldToday,
      dailyGoal,
    )

  const monthGoal =
    coordinators.reduce(
      (sum, item) =>
        sum + item.monthGoal,
      0,
    )

  const monthRealized =
    coordinators.reduce(
      (sum, item) =>
        sum +
        item.monthRealized,
      0,
    )

  const monthAchievementPercent =
    percentage(
      monthRealized,
      monthGoal,
    )

  const monthProjectionAmount =
    coordinators.reduce(
      (sum, item) =>
        sum +
        item.monthProjectionAmount,
      0,
    )

  const monthProjectionPercent =
    percentage(
      monthProjectionAmount,
      monthGoal,
    )

  const monthProjectionGap =
    monthProjectionAmount -
    monthGoal

  const priorities =
    buildPriorities(stores)

  const recoverableTotal =
    priorities.reduce(
      (sum, priority) =>
        sum +
        priority.recoverableGap,
      0,
    )

  const baseDate =
    buildBaseDate(api.date)

  const updatedAt =
    buildUpdatedAt(
      baseDate,
      api.updatedAt,
    )

  const missingCoordinators =
    COORDINATOR_NAMES.filter(
      (expectedName) =>
        !apiRows.some(
          (row) =>
            normalize(row.name) ===
            expectedName,
        ),
    )

  const missingFields = [
    ...(api.missingData ?? []),

    ...missingCoordinators.map(
      (name) =>
        `COORDENADORA ${name}`,
    ),
  ]

  const warnings = [
    api.warning,
  ].filter(
    (warning): warning is string =>
      Boolean(warning),
  )

  return {
    ok: true,

    contract: {
      name:
        'credvix.radar-operacao-comercial',

      version: '1.0.0',
    },

    source: {
      baseDate,
      updatedAt,

      generatedAt:
        new Date().toISOString(),

      provider: 'google-sheets',
    },

    summary: {
      paidToday,
      soldToday,
      pendingPayment,

      dailyGoal,
      dailyGap,
      newSalesNeeded,

      dailyAchievementPercent,
      soldTodayAchievementPercent,

      monthGoal,
      monthRealized,
      monthAchievementPercent,

      monthProjectionPercent,
      monthProjectionAmount,
      monthProjectionGap,

      totalStores: stores.length,

      // A API visual atual não fornece
      // curva horária confiável.
      pace: {
        actualPercent:
          dailyAchievementPercent,

        expectedPercent: null,
        differencePercent: null,
      },

      // Não existe regra oficial de
      // encerramento do ciclo na API.
      cycle: {
        remainingMinutes:
          getCommercialCycleRemainingMinutes(),
      },

      soldTodayStatus:
        soldTodayIndicator(
          soldTodayAchievementPercent,
        ),

      monthProjectionStatus:
        projectionIndicator(
          monthProjectionPercent,
        ),
    },

    coordinators,

    stores,

    priorities,

    priorityPanel: {
      headline:
        pendingPayment > 0
          ? 'Conversão é o foco da operação'
          : priorities.some(
            (priority) =>
              priority.type === 'zero',
          )
            ? 'Lojas zeradas exigem ação'
            : 'Recuperar a diária é o foco',

      recoverableTotal,
    },

    diagnosis:
      buildDiagnosis(
        coordinators,
        priorities,
      ),

    quality: {
      status:
        warnings.length ||
          missingFields.length
          ? 'warning'
          : 'ok',

      warnings,
      missingFields,

      sourceAgeMinutes:
        sourceAgeMinutes(updatedAt),
    },
  }
}

function getCommercialCycleRemainingMinutes() {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const hour = Number(
    parts.find((part) => part.type === 'hour')?.value ?? 0,
  )

  const minute = Number(
    parts.find((part) => part.type === 'minute')?.value ?? 0,
  )

  const currentMinutes = hour * 60 + minute

  const commercialEndMinutes = 18 * 60

  return Math.max(
    0,
    commercialEndMinutes - currentMinutes,
  )
}