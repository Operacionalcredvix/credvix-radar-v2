import {
  ArrowDownRight,
  ArrowUpRight,
  Target,
} from 'lucide-react'

import type {
  GoalIndicator,
  RadarSummary,
} from '../../../types/radar'

import {
  formatCompactCurrency,
  formatCurrency,
  formatSignedCompactCurrency,
} from '../../../utils/formatCurrency'

import { formatPercent } from '../../../utils/formatPercent'

type GoalsCardProps = {
  summary: RadarSummary
}

const statusStyles = {
  positive: {
    wrapper: 'bg-[#e9f6ee] text-[#23724e]',
    icon: ArrowUpRight,
  },

  attention: {
    wrapper: 'bg-[#fff2dc] text-[#99550b]',
    icon: ArrowDownRight,
  },

  critical: {
    wrapper: 'bg-[#fde9e5] text-[#bd432d]',
    icon: ArrowDownRight,
  },
} as const

function GoalStatusBadge({
  status,
}: {
  status: GoalIndicator
}) {
  const config = statusStyles[status.tone]
  const Icon = config.icon

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-[6px]
        rounded-full
        px-[10px]
        py-[5px]
        text-[12px]
        font-semibold
        ${config.wrapper}
      `}
    >
      <Icon
        size={14}
        strokeWidth={2.5}
      />

      {status.label}
    </span>
  )
}

function clampProgress(value: number) {
  return Math.min(Math.max(value, 0), 100)
}

export function GoalsCard({
  summary,
}: GoalsCardProps) {
  const soldProgress = clampProgress(
    summary.soldTodayAchievementPercent,
  )

  const projectionProgress = clampProgress(
    summary.monthProjectionPercent,
  )

  return (
    <section
      className="
        rounded-[10px]
        bg-white
        px-[32px]
        py-[26px]
        [@media(max-height:950px)]:py-[19px]
        text-[#171412]
        shadow-[0_16px_32px_rgba(32,24,18,0.10)]
      "
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px]">
          <Target
            size={23}
            strokeWidth={2.3}
            className="text-[#ff6900]"
          />

          <h2
            className="
              font-display
              text-[20px]
              font-bold
              tracking-[-0.02em]
            "
          >
            Metas
          </h2>
        </div>

        <span className="text-[13px] text-[#817a75]">
          Hoje e mês
        </span>
      </div>

      <div className="mt-[28px] [@media(max-height:950px)]:mt-[20px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3
              className="
                font-display
                text-[18px]
                font-semibold
                tracking-[-0.02em]
              "
            >
              Vendido hoje
            </h3>

            <p className="mt-[2px] text-[13px] text-[#8b837d]">
              Bruto
            </p>
          </div>

          <strong
            className="
              font-display
              text-[29px]
              font-bold
              leading-none
              tracking-[-0.035em]
            "
          >
            {formatCurrency(summary.soldToday)}
          </strong>
        </div>

        <div className="mt-[10px] h-[13px] overflow-hidden rounded-full bg-[#ebe7e4]">
          <div
            className="
              h-full
              rounded-full
              bg-gradient-to-r
              from-[#da5707]
              to-[#ff8a00]
            "
            style={{
              width: `${soldProgress}%`,
            }}
          />
        </div>

        <div className="mt-[8px] flex items-center gap-[9px]">
          <GoalStatusBadge
            status={summary.soldTodayStatus}
          />

          <span className="text-[13px] text-[#8b837d]">
            {formatCompactCurrency(
              summary.pendingPayment,
            )}{' '}
            aguardando checkout
          </span>
        </div>
      </div>

      <div className="mt-[31px] [@media(max-height:950px)]:mt-[22px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3
              className="
                font-display
                text-[18px]
                font-semibold
                tracking-[-0.02em]
              "
            >
              Projeção do mês
            </h3>

            <p className="mt-[2px] text-[13px] text-[#8b837d]">
              {formatPercent(
                summary.monthAchievementPercent,
                1,
              )}{' '}
              realizado
            </p>
          </div>

          <strong
            className="
              font-display
              text-[29px]
              font-bold
              leading-none
              tracking-[-0.035em]
            "
          >
            {formatPercent(
              summary.monthProjectionPercent,
              0,
            )}
          </strong>
        </div>

        <div className="mt-[10px] h-[13px] overflow-hidden rounded-full bg-[#ebe7e4]">
          <div
            className="
              h-full
              rounded-full
              bg-gradient-to-r
              from-[#ff9200]
              to-[#ffa000]
            "
            style={{
              width: `${projectionProgress}%`,
            }}
          />
        </div>

        <div className="mt-[8px] flex items-center justify-between gap-4">
          <GoalStatusBadge
            status={summary.monthProjectionStatus}
          />

          <span className="text-[13px] text-[#8b837d]">
            Gap projetado{' '}
            {formatSignedCompactCurrency(
              summary.monthProjectionGap,
            )}
          </span>
        </div>
      </div>
    </section>
  )
}