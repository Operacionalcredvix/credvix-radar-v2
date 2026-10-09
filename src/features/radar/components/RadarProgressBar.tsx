import type { GoalTone } from '../../../types/radar'

type RadarProgressBarProps = {
  percent: number
  tone: GoalTone
  label: string
  size?: 'sm' | 'md' | 'lg'
  dark?: boolean
}

const heightStyles = {
  sm: 'h-[12px]',
  md: 'h-[13px]',
  lg: 'h-[16px]',
} as const

const fillStyles: Record<GoalTone, string> = {
  positive: 'bg-[#35946b]',

  attention:
    'bg-gradient-to-r from-[#d95508] to-[#ff9800]',

  critical: 'bg-[#c8432d]',
}

export function RadarProgressBar({
  percent,
  tone,
  label,
  size = 'md',
  dark = false,
}: RadarProgressBarProps) {
  const safePercent = Number.isFinite(percent)
    ? Math.max(0, percent)
    : 0

  const visiblePercent = Math.min(
    safePercent,
    100,
  )

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={visiblePercent}
      aria-valuetext={`${safePercent.toFixed(1)}%`}
      className={`
        w-full
        overflow-hidden
        rounded-full
        ${heightStyles[size]}
        ${
          dark
            ? 'bg-[#443f3b]'
            : 'bg-[#ebe7e4]'
        }
      `}
    >
      <div
        className={`
          h-full
          rounded-full
          transition-[width]
          duration-500
          ease-out
          ${fillStyles[tone]}
        `}
        style={{
          width: `${visiblePercent}%`,
        }}
      />
    </div>
  )
}