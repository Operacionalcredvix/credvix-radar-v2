export const VERSION_CHECK_INTERVAL_MS = 15 * 60 * 1000

const RELOAD_PARAMETER = '__radar_build'

// Consultar somente o manifesto publicado, nunca o HEAD do repositório.
export function shouldReloadForVersion(
  runningBuildId: string,
  publishedBuildId: unknown,
  currentHref: string,
): publishedBuildId is string {
  if (
    typeof publishedBuildId !== 'string' ||
    !/^[a-zA-Z0-9._-]{8,120}$/.test(publishedBuildId) ||
    publishedBuildId === runningBuildId
  ) {
    return false
  }

  try {
    // Também impede o loop caso o navegador/TV sirva HTML antigo após recarregar.
    return new URL(currentHref).searchParams.get(RELOAD_PARAMETER) !== publishedBuildId
  } catch {
    return false
  }
}

export function versionedReloadUrl(currentHref: string, publishedBuildId: string): string {
  const url = new URL(currentHref)
  url.searchParams.set(RELOAD_PARAMETER, publishedBuildId)
  return url.toString()
}
