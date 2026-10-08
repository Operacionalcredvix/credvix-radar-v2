import { Clock3 } from 'lucide-react'

import type { RadarSummary } from '../../../types/radar'

import {
  formatCompactCurrency,
  formatCurrency,
} from '../../../utils/formatCurrency'

import { formatDuration } from '../../../utils/formatDuration'
import { formatPercent } from '../../../utils/formatPercent'

type PaidTodayCardProps = {
  summary: RadarSummary
}

export function PaidTodayCard({
  summary,
}: PaidTodayCardProps) {
  const progress = Math.min(
    Math.max(summary.dailyAchievementPercent, 0),
    100,
  )

  return (
    <section
      className="
        overflow-hidden
        rounded-[10px]
        bg-[#171411]
        px-[34px]
        py-[28px]
        [@media(max-height:950px)]:py-[20px]
        text-white
        shadow-[0_16px_32px_rgba(32,24,18,0.14)]
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <h2
            className="
              text-[17px]
              font-semibold
              uppercase
              tracking-[-0.01em]
              text-[#beb8b3]
            "
          >
            Pago hoje
          </h2>

          <p className="mt-[2px] text-[14px] text-[#a9a19c]">
            Liquidação D0 confirmada
          </p>
        </div>

        <div className="text-right">
          <strong
            className="
              font-display
              text-[43px]
              font-bold
              leading-none
              tracking-[-0.04em]
              text-[#ff7208]
            "
          >
            {formatPercent(
              summary.dailyAchievementPercent,
              0,
            )}
          </strong>

          <p className="mt-[4px] text-[14px] text-[#aaa29c]">
            da meta diária
          </p>
        </div>
      </div>

      <p
        className="
          mt-[13px]
          [@media(max-height:950px)]:mt-[9px]
          font-display
          text-[63px]
          [@media(max-height:950px)]:text-[58px]
          font-extrabold
          leading-none
          tracking-[-0.045em]
          text-white
        "
      >
        {formatCurrency(summary.paidToday)}
      </p>

      <div className="mt-[14px]">
        <div className="h-[16px] overflow-hidden rounded-full bg-[#443f3b]">
          <div
            className="
              h-full
              rounded-full
              bg-gradient-to-r
              from-[#d95508]
              to-[#ff9800]
            "
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="mt-[7px] flex items-center justify-between">
          <p className="text-[14px] text-[#aaa29c]">
            Ritmo esperado agora{' '}
            <strong className="font-semibold text-white">
              {formatPercent(
                summary.pace.expectedPercent ?? 0,
                0,
              )}
            </strong>{' '}
            acima do ritmo
          </p>

          <p className="text-[14px] text-[#aaa29c]">
            Meta{' '}
            <strong className="font-semibold text-white">
              {formatCurrency(summary.dailyGoal)}
            </strong>
          </p>
        </div>
      </div>

      <div className="my-[13px] [@media(max-height:950px)]:my-[9px] h-px bg-[#48413d]" />

      <div className="grid grid-cols-[1fr_auto] items-end gap-8">
        <div>
          <div className="flex items-baseline gap-[8px]">
            <span className="text-[14px] text-[#aaa29c]">
              Falta hoje
            </span>

            <strong
              className="
                font-display
                text-[30px]
                font-bold
                leading-none
                tracking-[-0.035em]
                text-[#ff9500]
              "
            >
              {formatCurrency(summary.dailyGap)}
            </strong>
          </div>

          <div className="mt-[8px] h-[12px] overflow-hidden rounded-full bg-[#443f3b]">
            <div
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-[#da5707]
                to-[#ff9700]
              "
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-[7px] flex items-center gap-5 text-[14px]">
            <p className="text-[#aaa29c]">
              Conversão{' '}
              <strong className="font-semibold text-white">
                {formatCompactCurrency(
                  summary.pendingPayment,
                )}
              </strong>
            </p>

            <p className="text-[#aaa29c]">
              Novas vendas{' '}
              <strong className="font-semibold text-white">
                {formatCompactCurrency(
                  summary.newSalesNeeded,
                )}
              </strong>
            </p>
          </div>
        </div>

        <div className="min-w-[118px] pb-[1px] text-right">
          <p className="flex items-center justify-end gap-[7px] text-[14px] text-[#aaa29c]">
            <Clock3
              size={16}
              strokeWidth={1.8}
            />

            Ciclo restante
          </p>

          <strong
            className="
              mt-[3px]
              block
              font-display
              text-[28px]
              font-semibold
              leading-none
              tracking-[-0.02em]
              text-white
            "
          >
            {formatDuration(
              summary.cycle.remainingMinutes ?? 0,
            )}
          </strong>
        </div>
      </div>
    </section>
  )
}