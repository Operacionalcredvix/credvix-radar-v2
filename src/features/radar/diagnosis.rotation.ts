export const DIAGNOSIS_DURATION_MS = 20_000
export const DIAGNOSIS_SLOT_COUNT = 4
export const DIAGNOSIS_CLOCK_POLL_MS = 1_000

/** Usa tempo decorrido, não a quantidade de callbacks (que pode atrasar em TVs). */
export function diagnosisIndexAt(now: number, startedAt: number): number {
  const elapsed = Math.max(0, now - startedAt)
  return Math.floor(elapsed / DIAGNOSIS_DURATION_MS) % DIAGNOSIS_SLOT_COUNT
}

type RotationScheduler = {
  now: () => number
  schedule: (callback: () => void, intervalMs: number) => number
  cancel: (timerId: number) => void
}

/**
 * Um único intervalo por montagem. Sem timers ligados à atualização dos dados.
 * O método check permite ressincronizar depois de suspensão de timers pela TV.
 */
export function startDiagnosisRotation(
  onChange: (index: number) => void,
  scheduler: RotationScheduler,
) {
  const startedAt = scheduler.now()
  let currentIndex = 0
  let disposed = false

  const check = () => {
    if (disposed) return

    const nextIndex = diagnosisIndexAt(scheduler.now(), startedAt)
    if (nextIndex === currentIndex) return

    currentIndex = nextIndex
    onChange(nextIndex)
  }

  const timerId = scheduler.schedule(check, DIAGNOSIS_CLOCK_POLL_MS)

  return {
    check,
    dispose: () => {
      if (disposed) return
      disposed = true
      scheduler.cancel(timerId)
    },
  }
}
