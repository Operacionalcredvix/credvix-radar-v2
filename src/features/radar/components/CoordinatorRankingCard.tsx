import {
  ArrowDownRight,
  ArrowUpRight,
  Crown,
  TriangleAlert,
} from 'lucide-react'

import type {
  Coordinator,
  GoalTone,
} from '../../../types/radar'

import { formatCurrencyWithoutCents } from '../../../utils/formatCurrency'
import { formatPercent } from '../../../utils/formatPercent'
import { getDailyTone } from '../radar.rules'
import { RadarProgressBar } from './RadarProgressBar'

type CoordinatorRankingCardProps = {
  coordinators: Coordinator[]
  totalStores: number
}

const projectionStyles: Record<
  GoalTone,
  {
    wrapper: string
    icon: typeof ArrowUpRight
  }
> = {
  positive: {
    wrapper: 'bg-[#e7f4ed] text-[#267350]',
    icon: ArrowUpRight,
  },

  attention: {
    wrapper: 'bg-[#fff1da] text-[#96550d]',
    icon: ArrowDownRight,
  },

  critical: {
    wrapper: 'bg-[#fde9e5] text-[#c04431]',
    icon: TriangleAlert,
  },
}

function ProjectionBadge({
  coordinator,
}: {
  coordinator: Coordinator
}) {
  const config =
    projectionStyles[coordinator.projectionTone]

  const Icon = config.icon

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-[5px]
        whitespace-nowrap
        rounded-full
        px-[9px]
        py-[4px]
        text-[11px]
        font-semibold
        ${config.wrapper}
      `}
    >
      <Icon
        size={13}
        strokeWidth={2.3}
      />

      Projeção{' '}
      {formatPercent(
        coordinator.monthProjectionPercent,
        0,
      )}
    </span>
  )
}

function RankingPosition({
  position,
}: {
  position: number
}) {
  const isFirst = position === 1

  return (
    <span
      className={`
        flex
        h-[34px]
        w-[34px]
        shrink-0
        items-center
        justify-center
        rounded-full
        font-display
        pl-[4px]
        pt-[2px]
        text-[14px]
        font-bold
        ${isFirst
          ? 'bg-[#ff6900] text-white'
          : 'bg-[#eceae8] text-[#2c2927]'
        }
      `}
    >
      {position}º
    </span>
  )
}

function CoordinatorRow({
  coordinator,
}: {
  coordinator: Coordinator
}) {
  const dailyTone = getDailyTone(
    coordinator.dailyAchievementPercent,
  )

  const isCritical = dailyTone === 'critical'

  return (
    <article
      className="
        rounded-[9px]
        border
        border-[#e7ded8]
        px-[16px]
        py-[10px]
        [@media(max-height:950px)]:py-[7px]
      "
    >
      <div className="flex items-center">
        <RankingPosition
          position={coordinator.rankingPosition}
        />

        <h3
          className="
            ml-[12px]
            font-display
            text-[18px]
            font-semibold
            tracking-[-0.025em]
            text-[#171412]
          "
        >
          {coordinator.name}
        </h3>

        <strong
          className={`
            ml-auto
            font-display
            text-[27px]
            font-bold
            leading-none
            tracking-[-0.035em]
            ${isCritical
              ? 'text-[#c6422c]'
              : 'text-[#171412]'
            }
          `}
        >
          {formatPercent(
            coordinator.dailyAchievementPercent,
            0,
          )}
        </strong>
      </div>

      <div className="mt-[8px] [@media(max-height:950px)]:mt-[6px]">
        <RadarProgressBar
          percent={coordinator.dailyAchievementPercent}
          tone={dailyTone}
          label={`Progresso diário de ${coordinator.name}`}
          size="sm"
        />
      </div>

      <div
        className="
          mt-[9px]
          [@media(max-height:950px)]:mt-[6px]
          grid
          grid-cols-[1.1fr_1fr_auto]
          items-center
          gap-[12px]
          text-[12px]
        "
      >
        <p className="whitespace-nowrap text-[#817a75]">
          <strong className="font-medium text-[#302c29]">
            {formatCurrencyWithoutCents(
              coordinator.paidToday,
            )}
          </strong>

          {' / '}

          {formatCurrencyWithoutCents(
            coordinator.dailyGoal,
          )}
        </p>

        <p className="text-center text-[#817a75]">
          Lojas zeradas:{' '}
          <strong className="font-medium text-[#302c29]">
            {coordinator.zeroStores}
          </strong>{' '}
          de {coordinator.storeCount}
        </p>

        <ProjectionBadge
          coordinator={coordinator}
        />
      </div>
    </article>
  )
}

export function CoordinatorRankingCard({
  coordinators,
  totalStores,
}: CoordinatorRankingCardProps) {
  const ranking = [...coordinators].sort(
    (a, b) =>
      a.rankingPosition - b.rankingPosition,
  )

  return (
    <section
      className="
        h-full
        rounded-[10px]
        bg-white
        px-[32px]
        py-[18px]
        [@media(max-height:950px)]:py-[13px]
        shadow-[0_16px_32px_rgba(32,24,18,0.10)]
      "
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-[9px]">
          <Crown
            size={21}
            strokeWidth={2.2}
            className="text-[#ff6900]"
          />

          <h2
            className="
              font-display
              text-[16px]
              font-bold
              tracking-[-0.025em]
              text-[#171412]
            "
          >
            Ranking de coordenações
          </h2>
        </div>

        <p className="text-[12px] text-[#817a75]">
          Realizado vs meta diária ·{' '}
          {totalStores} lojas
        </p>
      </header>

      <div className="mt-[12px] [@media(max-height:950px)]:mt-[8px] space-y-[8px]">
        {ranking.map((coordinator) => (
          <CoordinatorRow
            key={coordinator.id}
            coordinator={coordinator}
          />
        ))}
      </div>
    </section>
  )
}