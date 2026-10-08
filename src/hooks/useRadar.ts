import { useCallback, useEffect, useRef, useState } from 'react'

import { getRadarData } from '../services/radar.service'
import type { RadarPayload } from '../types/radar'

const DEFAULT_POLL_MS = 30_000

const configuredPollMs = Number(
  import.meta.env.VITE_RADAR_POLL_MS ?? DEFAULT_POLL_MS,
)

const POLL_MS =
  Number.isFinite(configuredPollMs) && configuredPollMs > 0
    ? configuredPollMs
    : DEFAULT_POLL_MS

export function useRadar() {
  const [data, setData] = useState<RadarPayload | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [lastSuccessfulFetchAt, setLastSuccessfulFetchAt] =
    useState<Date | null>(null)

  const requestInProgress = useRef(false)
  const hasData = useRef(false)

  const load = useCallback(async () => {
    if (requestInProgress.current) {
      return
    }

    requestInProgress.current = true

    if (hasData.current) {
      setIsRefreshing(true)
    }

    try {
      const payload = await getRadarData()

      if (!payload.ok) {
        throw new Error('O Radar retornou um payload inválido.')
      }

      setData(payload)

      hasData.current = true

      setError(null)
      setLastSuccessfulFetchAt(new Date())
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao carregar o Radar.'

      setError(message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)

      requestInProgress.current = false
    }
  }, [])

  useEffect(() => {
    const initialTimeout = window.setTimeout(() => {
      void load()
    }, 0)

    const interval = window.setInterval(() => {
      void load()
    }, POLL_MS)

    return () => {
      window.clearTimeout(initialTimeout)
      window.clearInterval(interval)
    }
  }, [load])

  return {
    data,

    isLoading,
    isRefreshing,

    error,

    lastSuccessfulFetchAt,

    refresh: load,
  }
}