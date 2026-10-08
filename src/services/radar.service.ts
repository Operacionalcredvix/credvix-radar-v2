import {
  adaptProductionApiToRadar,
  type ProductionApiPayload,
} from './radar.adapter'

import type { RadarPayload } from '../types/radar'

const DEFAULT_API_URL =
  'https://copa-colmeias-tv-panel.vercel.app/api/producao?refresh=1'

const API_URL =
  import.meta.env.VITE_RADAR_API_URL ??
  DEFAULT_API_URL

export async function getRadarData(): Promise<RadarPayload> {
  const response = await fetch(
    API_URL,
    {
      method: 'GET',

      cache: 'no-store',

      headers: {
        Accept: 'application/json',
      },
    },
  )

  let payload: ProductionApiPayload

  try {
    payload =
      (await response.json()) as ProductionApiPayload
  } catch {
    throw new Error(
      'A API do Radar retornou uma resposta inválida.',
    )
  }

  if (!response.ok || !payload.ok) {
    throw new Error(
      payload.message ||
        payload.error ||
        `Falha na API do Radar: HTTP ${response.status}.`,
    )
  }

  return adaptProductionApiToRadar(
    payload,
  )
}