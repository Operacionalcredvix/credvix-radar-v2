import {
  Megaphone,
  Store,
} from 'lucide-react'

import type {
  Coordinator,
  PriorityPanel,
  PrioritySeverity,
  RadarPriority,
} from '../../../types/radar'

import { formatCurrencyWithoutCents } from '../../../utils/formatCurrency'

type PriorityCardProps = {
  priorities: RadarPriority[]
  coordinators: Coordinator[]
  panel: PriorityPanel
}

const severityConfig: Record<
  PrioritySeverity,
  {
    label: string
    className: string
  }
> = {
  critical: {
    label: 'Crítica',
    className:
      'bg-[#c94730] text-white',
  },

  high: {
    label: 'Alta',
    className:
      'bg-[#fde5df] text-[#c34531]',
  },

  medium: {
    label: 'Média',
    className:
      'bg-[#fff0d5] text-[#a6620d]',
  },
}

function getCoordinatorName(
  coordinators: Coordinator[],
  coordinatorId: string,
) {
  return (
    coordinators.find(
      (coordinator) =>
        coordinator.id === coordinatorId,
    )?.name ?? '—'
  )
}

function PriorityRow({
  priority,
  position,
  coordinators,
}: {
  priority: RadarPriority
  position: number
  coordinators: Coordinator[]
}) {
  const severity =
    severityConfig[priority.severity]

  const coordinatorName =
    getCoordinatorName(
      coordinators,
      priority.coordinatorId,
    )

  return (
    <article
      className="
        grid
        grid-cols-[22px_1fr_auto]
        gap-[10px]
        border-b
        border-[#e9e3df]
        px-[32px]
        py-[7px]
        [@media(max-height:950px)]:py-[5px]
        last:border-b-0
      "
    >
      <div
        className="
          pt-[5px]
          text-[14px]
          font-medium
          text-[#817a75]
        "
      >
        {position}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-[8px]">
          <span
            className={`
              shrink-0
              rounded-full
              px-[9px]
              py-[3px]
              text-[11px]
              font-semibold
              ${severity.className}
            `}
          >
            {severity.label}
          </span>

          <h3
            className="
              truncate
              font-display
              text-[14px]
              font-bold
              tracking-[-0.02em]
              text-[#171412]
            "
          >
            {priority.title}
          </h3>
        </div>

        <div
          className="
            mt-[4px]
            flex
            items-center
            gap-[6px]
            text-[12px]
            text-[#8a827c]
          "
        >
          <Store
            size={15}
            strokeWidth={1.7}
            className="shrink-0"
          />

          <span className="truncate">
            {priority.detail}
            {' - '}
            {coordinatorName}
          </span>
        </div>
      </div>

      <strong
        className="
          self-center
          whitespace-nowrap
          font-display
          text-[20px]
          font-bold
          tracking-[-0.035em]
          text-[#171412]
        "
      >
        {formatCurrencyWithoutCents(
          priority.recoverableGap,
        )}
      </strong>
    </article>
  )
}

export function PriorityCard({
  priorities,
  coordinators,
  panel,
}: PriorityCardProps) {
  return (
    <section
      className="
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[10px]
        bg-white
        shadow-[0_16px_32px_rgba(32,24,18,0.10)]
      "
    >
      <header
        className="
          flex
          min-h-[57px]
          [@media(max-height:950px)]:min-h-[50px]
          items-center
          gap-[12px]
          bg-[#171411]
          px-[32px]
          py-[9px]
          text-white
        "
      >
        <Megaphone
          size={23}
          strokeWidth={2}
          className="
            shrink-0
            text-[#ff7108]
          "
        />

        <div>
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              leading-none
              text-[#bdb5af]
            "
          >
            Prioridade agora
          </p>

          <h2
            className="
              mt-[3px]
              font-display
              text-[16px]
              font-bold
              leading-none
              tracking-[-0.02em]
              text-white
            "
          >
            {panel.headline}
          </h2>
        </div>
      </header>

      <div className="flex-1">
        {priorities.map((priority) => (
          <PriorityRow
            key={priority.id}
            priority={priority}
            position={priority.position}
            coordinators={coordinators}
          />
        ))}
      </div>

      <footer
        className="
          flex
          min-h-[56px]
          [@media(max-height:950px)]:min-h-[49px]
          items-center
          justify-between
          bg-[#f6f3f1]
          px-[32px]
        "
      >
        <p className="text-[13px] text-[#292522]">
          Recuperável nestas{' '}
          {priorities.length} ações
        </p>

        <strong
          className="
            font-display
            text-[27px]
            font-bold
            tracking-[-0.035em]
            text-[#ef650d]
          "
        >
          {formatCurrencyWithoutCents(
            panel.recoverableTotal,
          )}
        </strong>
      </footer>
    </section>
  )
}