import { RadarHeader } from '../features/radar/components/RadarHeader'
import { useRadar } from '../hooks/useRadar'
import { PaidTodayCard } from '../features/radar/components/PaidTodayCard'
import { GoalsCard } from '../features/radar/components/GoalsCard'
import { CoordinatorRankingCard } from '../features/radar/components/CoordinatorRankingCard'
import { PriorityCard } from '../features/radar/components/PriorityCard'
import { DiagnosisFooter } from '../features/radar/components/DiagnosisFooter'
import { buildRotatingDiagnoses } from '../features/radar/radar.rotating-diagnosis'

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
      radar-screen
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
        radar-screen-top
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
        radar-screen-bottom
        grid
        min-h-0
        min-w-0
        flex-1
        overflow-hidden
        grid-cols-[1.38fr_1fr]
        grid-rows-[minmax(0,1fr)]
        items-stretch
        gap-[20px]
      "
      >
        <CoordinatorRankingCard
          coordinators={data.coordinators}
          totalStores={data.summary.totalStores}
        />

        <PriorityCard
          stores={data.stores}
          coordinators={data.coordinators}
        />
      </div>

      <DiagnosisFooter
        diagnoses={buildRotatingDiagnoses(data)}
      />
    </main>
  )
}