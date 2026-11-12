import { Store as StoreIcon } from 'lucide-react'

import type {
  Coordinator,
  Store as RadarStore,
} from '../../../types/radar'

import { formatCurrencyWithoutCents } from '../../../utils/formatCurrency'
import './PriorityCard.css'

type PriorityCardProps = {
  stores: RadarStore[]
  coordinators: Coordinator[]
}

function StoreRankingRow({
  store,
  position,
  coordinatorName,
}: {
  store: RadarStore
  position: number
  coordinatorName: string
}) {
  return (
    <li
      className="
        credvix-store-row
        grid
        grid-cols-[24px_minmax(0,1fr)_auto]
        items-center
        gap-[10px]
        border-b
        border-[#e9e3df]
        px-[26px]
        py-[9px]
        [@media(max-height:950px)]:px-[18px]
        [@media(max-height:950px)]:py-[6px]
      "
    >
      <span className="text-[14px] font-medium tabular-nums text-[#817a75]">
        {position}
      </span>

      <div className="min-w-0">
        <h3 className="truncate font-display text-[14px] font-bold tracking-[-0.02em] text-[#171412]">
          {store.name}
        </h3>

        <p className="mt-[3px] truncate text-[12px] text-[#817a75]">
          Coord.:{' '}
          <strong className="font-bold text-[#302c29]">
            {coordinatorName}
          </strong>
        </p>
      </div>

      <div className="credvix-store-values shrink-0 whitespace-nowrap text-right tabular-nums">
        <p className="text-[12px] text-[#817a75]">
          Vendido hoje:{' '}
          <strong className="font-bold text-[#171412]">
            {formatCurrencyWithoutCents(store.soldToday)}
          </strong>
        </p>

        <p className="mt-[3px] text-[12px] text-[#817a75]">
          Recuperação:{' '}
          <strong
            className={
              'font-bold ' +
              (store.dailyGap > 0
                ? 'text-[#c94730]'
                : 'text-[#267350]')
            }
          >
            {formatCurrencyWithoutCents(store.dailyGap)}
          </strong>
        </p>
      </div>
    </li>
  )
}

export function PriorityCard({
  stores,
  coordinators,
}: PriorityCardProps) {
  const rankedStores = [...stores].sort(
    (a, b) =>
      b.soldToday - a.soldToday ||
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }) ||
      a.id.localeCompare(b.id),
  )

  const coordinatorNames = new Map(
    coordinators.map((coordinator) => [
      coordinator.id,
      coordinator.name,
    ]),
  )

  const zeroStores = stores.filter((store) => store.isZero).length

  const totalSoldToday = rankedStores.reduce(
    (sum, store) => sum + store.soldToday,
    0,
  )

  // Tempo proporcional ao total de lojas, com velocidade constante de leitura.
  const scrollDuration = String(
    Math.max(45, rankedStores.length * 3.8),
  ) + 's'

  const renderList = (copy: number) => (
    <ol
      key={copy}
      aria-hidden={copy > 0 ? true : undefined}
      className="m-0 list-none p-0"
    >
      {rankedStores.map((store, index) => (
        <StoreRankingRow
          key={String(copy) + '-' + store.id}
          store={store}
          position={index + 1}
          coordinatorName={
            coordinatorNames.get(store.coordinatorId) ?? 'Não informado'
          }
        />
      ))}
    </ol>
  )

  return (
    <section
      className="
        flex
        h-full
        max-h-full
        min-h-0
        min-w-0
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
          shrink-0
          [@media(max-height:950px)]:min-h-[50px]
          items-center
          gap-[12px]
          bg-[#171411]
          px-[32px]
          py-[9px]
          text-white
          [@media(max-height:950px)]:px-[18px]
        "
      >
        <StoreIcon
          size={23}
          strokeWidth={2}
          className="shrink-0 text-[#ff7108]"
        />

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase leading-none text-[#bdb5af]">
            Todas as lojas · {rankedStores.length} lojas
          </p>

          <h2 className="mt-[3px] truncate font-display text-[16px] font-bold leading-none tracking-[-0.02em] text-white">
            Ranking por vendas de hoje
          </h2>
        </div>
      </header>

      <div
        className="credvix-store-viewport relative min-h-0 flex-1 overflow-hidden"
        aria-label="Lojas ordenadas por vendas realizadas hoje, do maior para o menor valor"
      >
        {rankedStores.length > 0 ? (
          <div
            className={rankedStores.length > 1 ? 'credvix-store-loop' : ''}
            style={{ animationDuration: scrollDuration }}
          >
            {renderList(0)}
            {rankedStores.length > 1 && renderList(1)}
            {rankedStores.length > 1 && renderList(2)}
          </div>
        ) : (
          <p className="px-[26px] py-[18px] text-[13px] text-[#817a75]">
            Nenhuma loja disponível.
          </p>
        )}
      </div>

      <footer
        className="
          flex
          min-h-[56px]
          shrink-0
          [@media(max-height:950px)]:min-h-[49px]
          items-center
          justify-between
          flex-wrap
          gap-[8px]
          bg-[#f6f3f1]
          px-[32px]
          [@media(max-height:950px)]:px-[18px]
        "
      >
        <p className="text-[12px] text-[#292522]">
          Lojas zeradas: {zeroStores}
        </p>

        <strong className="whitespace-nowrap font-display text-[25px] font-bold tracking-[-0.035em] text-[#ef650d] [@media(max-height:950px)]:text-[23px]">
          {formatCurrencyWithoutCents(totalSoldToday)}
        </strong>
      </footer>
    </section>
  )
}
