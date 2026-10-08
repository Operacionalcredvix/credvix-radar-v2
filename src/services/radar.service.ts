import { radarMock } from '../mocks/radar.mock'
import type { RadarPayload } from '../types/radar'

const MOCK_DELAY_MS = 400

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export async function getRadarData(): Promise<RadarPayload> {
  await wait(MOCK_DELAY_MS)

  return radarMock
}