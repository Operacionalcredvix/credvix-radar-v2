export function formatDuration(minutes: number) {
  const safeMinutes = Math.max(0, Math.floor(minutes))

  const hours = Math.floor(safeMinutes / 60)
  const remainingMinutes = safeMinutes % 60

  return `${String(hours).padStart(2, '0')}h${String(
    remainingMinutes,
  ).padStart(2, '0')}`
}