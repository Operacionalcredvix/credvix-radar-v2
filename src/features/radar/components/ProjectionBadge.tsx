import {
  ArrowDownRight,
  ArrowUpRight,
  TriangleAlert,
} from 'lucide-react'
import type { GoalTone } from '../../../types/radar'
import { formatPercent } from '../../../utils/formatPercent'

const projectionStyles: Record<GoalTone, { wrapper: string; icon: typeof ArrowUpRight }> = {
  positive: { wrapper: 'bg-[#e7f4ed] text-[#267350]', icon: ArrowUpRight },
  attention: { wrapper: 'bg-[#fff1da] text-[#96550d]', icon: ArrowDownRight },
  critical: { wrapper: 'bg-[#fde9e5] text-[#c04431]', icon: TriangleAlert },
}

export function ProjectionBadge({
  percent,
  tone,
}: {
  percent: number | null
  tone: GoalTone | null
}) {
  if (percent === null || !Number.isFinite(percent) || tone === null) {
    return (
      <span className="inline-flex max-w-full items-center whitespace-nowrap rounded-full bg-[#eceae8] px-[9px] py-[4px] text-[11px] font-semibold text-[#817a75]">
        Projeção indisponível
      </span>
    )
  }

  const config = projectionStyles[tone]
  const Icon = config.icon

  return (
    <span className={`inline-flex max-w-full shrink-0 items-center gap-[5px] whitespace-nowrap rounded-full px-[9px] py-[4px] text-[11px] font-semibold ${config.wrapper}`}>
      <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
      Projeção {formatPercent(percent, 0)}
    </span>
  )
}
