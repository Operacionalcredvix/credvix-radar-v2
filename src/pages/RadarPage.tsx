import { RadarHeader } from '../features/radar/components/RadarHeader'
import { useRadar } from '../hooks/useRadar'
import { PaidTodayCard } from '../features/radar/components/PaidTodayCard'
import { GoalsCard } from '../features/radar/components/GoalsCard'
import { CoordinatorRankingCard } from '../features/radar/components/CoordinatorRankingCard'
import { PriorityCard } from '../features/radar/components/PriorityCard'
import { DiagnosisFooter } from '../features/radar/components/DiagnosisFooter'

export function RadarPage() {
  const {
    data,
    isLoading,
    error,
    refresh,
  } = useRadar()

  if (isLoading && !data) {
    return (
      <main>
        <p>Carregando Radar...</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main>
        <p>Não foi possível carregar o Radar.</p>

        {error && <p>{error}</p>}

        <button
          type="button"
          onClick={refresh}
        >
          Tentar novamente
        </button>
      </main>
    )
  }

  return (
    <main
      className="
      flex
      h-dvh
      flex-col
      gap-[clamp(12px,1.5vh,20px)]
      overflow-hidden
      bg-[#f7f5f2]
      px-[clamp(24px,2vw,40px)]
      py-[clamp(12px,1.5vh,20px)]
      text-[#171412]
    "
    >
      <RadarHeader
        sourceUpdatedAt={data.source.updatedAt}
      />

      <div
        className="
        grid
        grid-cols-[1.38fr_1fr]
        gap-[20px]
      "
      >
        <PaidTodayCard
          summary={data.summary}
        />

        <GoalsCard
          summary={data.summary}
        />
      </div>

      <div
        className="
        grid
        grid-cols-[1.38fr_1fr]
        items-stretch
        gap-[20px]
      "
      >
        <CoordinatorRankingCard
          coordinators={data.coordinators}
          totalStores={data.summary.totalStores}
        />

        <PriorityCard
          priorities={data.priorities}
          coordinators={data.coordinators}
          panel={data.priorityPanel}
        />
      </div>

      <DiagnosisFooter
        diagnosis={data.diagnosis}
      />
    </main>
  )
}