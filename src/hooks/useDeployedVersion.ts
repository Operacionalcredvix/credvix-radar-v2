import { useEffect } from 'react'
import {
  shouldReloadForVersion,
  VERSION_CHECK_INTERVAL_MS,
  versionedReloadUrl,
} from '../utils/deploymentVersion'

type PublishedVersion = {
  buildId?: unknown
}

export function useDeployedVersion() {
  useEffect(() => {
    let disposed = false
    let requestInProgress = false
    const manifestUrl = `${import.meta.env.BASE_URL}version.json`

    async function checkPublishedVersion() {
      if (disposed || requestInProgress) return

      requestInProgress = true

      try {
        // Timestamp e no-store evitam caches intermediários e caches de Smart TVs.
        const url = `${manifestUrl}?_=${Date.now()}`
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok) return

        const published = (await response.json()) as PublishedVersion
        if (
          !disposed &&
          shouldReloadForVersion(
            __RADAR_BUILD_ID__,
            published?.buildId,
            window.location.href,
          )
        ) {
          // Mantém pathname, demais query params e hash; a nova query força HTML atualizado.
          window.location.replace(
            versionedReloadUrl(window.location.href, published.buildId as string),
          )
        }
      } catch {
        // Falha de rede ou manifesto inválido: manter o painel aberto e tentar novamente.
      } finally {
        requestInProgress = false
      }
    }

    // A primeira verificação também detecta uma TV iniciada a partir de HTML em cache.
    const initialCheck = window.setTimeout(() => {
      void checkPublishedVersion()
    }, 0)

    const interval = window.setInterval(() => {
      void checkPublishedVersion()
    }, VERSION_CHECK_INTERVAL_MS)

    // TVs podem suspender timers quando a aba perde foco; conferir ao retornar.
    const checkOnVisible = () => {
      if (document.visibilityState === 'visible') void checkPublishedVersion()
    }
    const checkOnPageShow = () => {
      void checkPublishedVersion()
    }

    document.addEventListener('visibilitychange', checkOnVisible)
    window.addEventListener('pageshow', checkOnPageShow)
    window.addEventListener('online', checkOnPageShow)

    return () => {
      disposed = true
      window.clearTimeout(initialCheck)
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', checkOnVisible)
      window.removeEventListener('pageshow', checkOnPageShow)
      window.removeEventListener('online', checkOnPageShow)
    }
  }, [])
}
