const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const currencyWithoutCentsFormatter =
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatCompactCurrency(value: number) {
  const absoluteValue = Math.abs(value)

  if (absoluteValue >= 1_000_000) {
    return `R$ ${(value / 1_000_000)
      .toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} mi`
  }

  if (absoluteValue >= 1_000) {
    return `R$ ${(value / 1_000)
      .toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} mil`
  }

  return formatCurrency(value)
}

export function formatSignedCompactCurrency(
  value: number,
) {
  if (value === 0) {
    return formatCompactCurrency(0)
  }

  const sign = value > 0 ? '+ ' : '- '

  return `${sign}${formatCompactCurrency(
    Math.abs(value),
  )}`
}

export function formatCurrencyWithoutCents(
  value: number,
) {
  return currencyWithoutCentsFormatter.format(value)
}