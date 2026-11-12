import { CheckCircle2, Crown } from 'lucide-react'

import type { Coordinator } from '../../../types/radar'

import {
  formatCurrency,
  formatCurrencyWithoutCents,
} from '../../../utils/formatCurrency'
import { formatPercent } from '../../../utils/formatPercent'
import { ProjectionBadge } from './ProjectionBadge'
import { getDailyTone } from '../radar.rules'
import { RadarProgressBar } from './RadarProgressBar'

type CoordinatorRankingCardProps = {
  coordinators: Coordinator[]
  totalStores: number
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

function getAccumulatedSurplus(coordinator: Coordinator): number | null {
  const { recoveryToday, paidToday, monthRealizedClosed, cumulativeTargetToday } = coordinator
  if (
    recoveryToday === null || monthRealizedClosed === null ||
    cumulativeTargetToday === null ||
    !Number.isFinite(paidToday)
  ) return null

  const surplus = monthRealizedClosed + paidToday - cumulativeTargetToday
  return Number.isFinite(surplus) ? Math.max(0, surplus) : null
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
  const recoveryToday = coordinator.recoveryToday
  const isOnTrack =
    recoveryToday !== null &&
    Number.isFinite(recoveryToday) &&
    Number.isFinite(coordinator.paidToday) &&
    coordinator.paidToday + 0.005 >= recoveryToday
  const surplus = isOnTrack
    ? getAccumulatedSurplus(coordinator)
    : null

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
        <div className="min-w-0">
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

          {isOnTrack ? (
            <p
              className="
                mt-[2px]
                flex
                flex-wrap
                items-center
                gap-x-[6px]
                font-bold
                text-[#267350]
                [@media(max-height:800px)]:text-[11px]
              "
            >
              <CheckCircle2
                size={12}
                strokeWidth={2.4}
                className="shrink-0"
                aria-hidden="true"
              />
              <span className="whitespace-nowrap">
                Em dia no acumulado
              </span>
              {surplus !== null && surplus >= 0.005 && (
                <strong className="whitespace-nowrap font-bold">
                  + {formatCurrency(surplus)}
                </strong>
              )}
            </p>
          ) : (
            <p className="mt-[2px] whitespace-nowrap font-bold text-[#302c29] [@media(max-height:800px)]:text-[11px]">
              Recuperação:{' '}
              <strong className="font-bold text-[#302c29]">
                {recoveryToday === null
                  ? 'Indisponível'
                  : formatCurrency(recoveryToday)}
              </strong>
            </p>
          )}
        </div>

        <p className="text-center text-[#817a75]">
          Lojas zeradas:{' '}
          <strong className="font-medium text-[#302c29]">
            {coordinator.zeroStores}
          </strong>{' '}
          de {coordinator.storeCount}
        </p>

        <ProjectionBadge
          percent={coordinator.monthProjectionPercent}
          tone={coordinator.projectionTone}
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