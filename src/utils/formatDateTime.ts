export function formatTime(value: string | Date) {
  const date =
    value instanceof Date
      ? value
      : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '--:--'
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(value: string | Date) {
  const date =
    value instanceof Date
      ? value
      : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '--/--/----'
  }

  return date.toLocaleDateString('pt-BR')
}

export function formatLongDate(value: string | Date) {
  const date =
    value instanceof Date
      ? value
      : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const formatted = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  const withCapitalizedStart =
    formatted.charAt(0).toUpperCase() +
    formatted.slice(1)

  return withCapitalizedStart.replace(
    / de ([a-zà-ÿ])/u,
    (_, letter: string) =>
      ` de ${letter.toUpperCase()}`,
  )
}