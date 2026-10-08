import { useClock } from '../../../hooks/useClock'

import {
  formatLongDate,
  formatTime,
} from '../../../utils/formatDateTime'

type RadarHeaderProps = {
  sourceUpdatedAt: string
}

export function RadarHeader({
  sourceUpdatedAt,
}: RadarHeaderProps) {
  const now = useClock()

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img
          src={`${import.meta.env.BASE_URL}credvix-mark.png`}
          alt=""
          className="h-12 w-12 shrink-0 object-contain"
        />

        <div>
          <p className="font-display text-[12px] font-bold uppercase tracking-[0.22em] text-[#f26513]">
            Credvix
          </p>

          <h1 className="mt-1 font-display text-[21px] font-extrabold leading-none tracking-[-0.025em] text-[#111111]">
            RADAR DE OPERAÇÃO COMERCIAL
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-7">
        <div className="text-right">
          <p className="text-[13px] font-normal text-[#817a75]">
            {formatLongDate(now)}
          </p>

          <p className="mt-1 text-[13px] text-[#292522]">
            Última carga{' '}
            <strong className="font-bold text-[#111111]">
              {formatTime(sourceUpdatedAt)}
            </strong>
          </p>
        </div>

        <time
          dateTime={now.toISOString()}
          className="min-w-[108px] text-right font-display text-[46px] font-extrabold leading-none tracking-[-0.045em] text-[#0d0c0b]"
        >
          {formatTime(now)}
        </time>
      </div>
    </header>
  )
}