import { useEffect, useState } from 'react'
import { startDiagnosisRotation } from '../features/radar/diagnosis.rotation'

export function useDiagnosisRotation() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const rotation = startDiagnosisRotation(setActiveIndex, {
      now: () => Date.now(),
      schedule: (callback, intervalMs) =>
        window.setInterval(callback, intervalMs),
      cancel: (timerId) => window.clearInterval(timerId),
    })

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        rotation.check()
      }
    }

    // Recupera o intervalo correto após suspensão da aba/Smart TV.
    window.addEventListener('pageshow', rotation.check)
    window.addEventListener('focus', rotation.check)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.removeEventListener('pageshow', rotation.check)
      window.removeEventListener('focus', rotation.check)
      document.removeEventListener('visibilitychange', onVisible)
      rotation.dispose()
    }
  }, [])

  return activeIndex
}
