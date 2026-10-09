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

      <div className="flex items-center justify-end gap-[16px]">
        <div className="flex flex-col items-end">
          <p className="whitespace-nowrap text-[13px] font-normal text-[#817a75]">
            {formatLongDate(now)}
          </p>

          <span className="whitespace-nowrap font-display text-[18px] font-bold leading-none text-[#292522]">
            Última carga:
          </span>
        </div>

        <time
          dateTime={sourceUpdatedAt}
          className="whitespace-nowrap font-display text-[46px] font-extrabold leading-none tracking-[-0.045em] text-[#0d0c0b]"
        >
          {formatTime(sourceUpdatedAt)}
        </time>
      </div>
    </header>
  )
}