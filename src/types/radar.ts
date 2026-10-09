export type RadarStatus =
  | 'critical'
  | 'attention'
  | 'controlled'

export type GoalTone =
  | 'positive'
  | 'attention'
  | 'critical'

export type PriorityType =
  | 'zero'
  | 'conversion'
  | 'below-daily'

export type PrioritySeverity =
  | 'critical'
  | 'high'
  | 'medium'

export type QualityStatus =
  | 'ok'
  | 'warning'
  | 'error'

export type GoalIndicator = {
  label: string
  tone: GoalTone
}

export type RadarSource = {
  baseDate: string
  updatedAt: string
  generatedAt: string
  provider: 'google-sheets'
}

export type RadarPace = {
  actualPercent: number
  expectedPercent: number | null
  differencePercent: number | null
}

export type RadarCycle = {
  remainingMinutes: number | null
}

export type RadarSummary = {
  paidToday: number
  soldToday: number
  pendingPayment: number

  dailyGoal: number
  dailyGap: number
  newSalesNeeded: number

  dailyAchievementPercent: number
  soldTodayAchievementPercent: number

  monthGoal: number
  monthRealized: number
  monthAchievementPercent: number

  monthProjectionPercent: number
  monthProjectionAmount: number
  monthProjectionGap: number

  totalStores: number

  pace: RadarPace
  cycle: RadarCycle

  soldTodayStatus: GoalIndicator
  monthProjectionStatus: GoalIndicator
}

export type Coordinator = {
  id: string
  name: string

  rankingPosition: number

  status: RadarStatus
  statusReason: string

  projectionTone: GoalTone

  paidToday: number
  soldToday: number
  pendingPayment: number

  dailyGoal: number
  dailyGap: number
  dailyAchievementPercent: number

  monthGoal: number
  monthRealized: number
  monthAchievementPercent: number

  monthProjectionPercent: number
  monthProjectionAmount: number
  monthProjectionGap: number

  zeroStores: number
  storeCount: number
}

export type Store = {
  id: string
  name: string
  coordinatorId: string

  paidToday: number
  soldToday: number
  pendingPayment: number

  dailyGoal: number
  dailyGap: number
  dailyAchievementPercent: number

  isZero: boolean
}

export type RadarPriority = {
  id: string

  position: number

  type: PriorityType
  severity: PrioritySeverity

  coordinatorId: string
  storeId?: string

  title: string
  detail: string

  recoverableGap: number
}

export type PriorityPanel = {
  headline: string
  recoverableTotal: number
}

export type RadarDiagnosis = {
  priorityCoordinatorId?: string

  status: RadarStatus

  headline: string
  detail: string

  generatedBy:
  | 'deterministic'
  | 'deepseek'
}

export type RadarQuality = {
  status: QualityStatus

  warnings: string[]
  missingFields: string[]

  sourceAgeMinutes: number | null
}

export type RadarPayload = {
  ok: boolean

  contract: {
    name: 'credvix.radar-operacao-comercial'
    version: '1.0.0'
  }

  source: RadarSource

  summary: RadarSummary

  coordinators: Coordinator[]
  stores: Store[]

  priorities: RadarPriority[]
  priorityPanel: PriorityPanel

  diagnosis: RadarDiagnosis

  quality: RadarQuality
}