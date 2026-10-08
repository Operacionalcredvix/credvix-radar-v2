export function formatPercent(
  value: number,
  maximumFractionDigits = 1,
) {
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })}%`
}