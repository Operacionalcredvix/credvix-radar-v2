import type {
  GoalTone,
  PrioritySeverity,
  Store,
} from '../../types/radar'

export const RADAR_THRESHOLDS = {
  projection: {
    dangerBelow: 70,
    successAt: 90,
  },

  daily: {
    dangerBelow: 35,
    successAt: 100,
  },

  sold: {
    dangerBelow: 70,
    successAt: 100,
  },

  priority: {
    criticalRatio: 0.5,
    highRatio: 0.25,
  },
} as const

export function getProjectionTone(
  percent: number,
): GoalTone {
  if (
    percent >=
    RADAR_THRESHOLDS.projection.successAt
  ) {
    return 'positive'
  }

  if (
    percent >=
    RADAR_THRESHOLDS.projection.dangerBelow
  ) {
    return 'attention'
  }

  return 'critical'
}

export function getDailyTone(
  percent: number,
): GoalTone {
  if (
    percent >=
    RADAR_THRESHOLDS.daily.successAt
  ) {
    return 'positive'
  }

  if (
    percent >=
    RADAR_THRESHOLDS.daily.dangerBelow
  ) {
    return 'attention'
  }

  return 'critical'
}

export function getSoldTone(
  percent: number,
): GoalTone {
  if (
    percent >=
    RADAR_THRESHOLDS.sold.successAt
  ) {
    return 'positive'
  }

  if (
    percent >=
    RADAR_THRESHOLDS.sold.dangerBelow
  ) {
    return 'attention'
  }

  return 'critical'
}

export function getPrioritySeverity(
  store: Store,
  recoverableGap: number,
): PrioritySeverity {
  // Uma loja zerada sempre exige ação crítica.
  if (store.isZero) {
    return 'critical'
  }

  if (store.dailyGoal <= 0) {
    return 'medium'
  }

  const ratio =
    recoverableGap / store.dailyGoal

  if (
    ratio >=
    RADAR_THRESHOLDS.priority.criticalRatio
  ) {
    return 'critical'
  }

  if (
    ratio >=
    RADAR_THRESHOLDS.priority.highRatio
  ) {
    return 'high'
  }

  return 'medium'
}