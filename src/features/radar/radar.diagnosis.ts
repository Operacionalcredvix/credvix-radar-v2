import type {
  Coordinator,
  RadarDiagnosis,
  RadarPriority,
  RadarStatus,
} from '../../types/radar'

import { formatCompactCurrency } from '../../utils/formatCurrency'
import { formatPercent } from '../../utils/formatPercent'

function describeAction(priority?: RadarPriority): string {
  if (!priority) {
    return 'Reforçar o plano de recuperação das lojas.'
  }

  if (priority.type === 'zero') {
    return `Acionar ${priority.title}, sem vendas hoje.`
  }

  if (priority.type === 'conversion') {
    return `Converter até ${formatCompactCurrency(
      priority.recoverableGap,
    )} em ${priority.title}.`
  }

  return `Atuar no gap de ${formatCompactCurrency(
    priority.recoverableGap,
  )} em ${priority.title}.`
}

export function buildRadarDiagnosis(
  coordinators: Coordinator[],
  priorities: RadarPriority[],
): RadarDiagnosis {
  if (
    coordinators.length !== 3 ||
    coordinators.some(
      (item) => item.monthGoal <= 0 || item.dailyGoal <= 0,
    )
  ) {
    return {
      status: 'attention',
      headline: 'Dados incompletos:',
      detail: 'diagnóstico suspenso até validar as três coordenações.',
      generatedBy: 'deterministic',
    }
  }

  const status: RadarStatus = coordinators.some(
    (item) => item.status === 'critical',
  )
    ? 'critical'
    : coordinators.some(
          (item) => item.status === 'attention',
        )
      ? 'attention'
      : 'controlled'

  const worstProjection = coordinators.reduce(
    (worst, item) =>
      item.monthProjectionPercent < worst.monthProjectionPercent
        ? item
        : worst,
  )

  const mostZeros = coordinators.reduce(
    (worst, item) =>
      item.zeroStores > worst.zeroStores ? item : worst,
  )

  const worstDaily = coordinators.reduce(
    (worst, item) =>
      item.dailyAchievementPercent < worst.dailyAchievementPercent
        ? item
        : worst,
  )

  const totalPending = coordinators.reduce(
    (sum, item) => sum + item.pendingPayment,
    0,
  )

  const topConversion = priorities.find(
    (item) => item.type === 'conversion',
  )

  const actionFor = (coordinatorId: string) =>
    describeAction(
      priorities.find(
        (item) => item.coordinatorId === coordinatorId,
      ),
    )

  function result(
    coordinator: Coordinator,
    headline: string,
    detail: string,
  ): RadarDiagnosis {
    return {
      priorityCoordinatorId: coordinator.id,
      status,
      headline,
      detail,
      generatedBy: 'deterministic',
    }
  }

  // 1. Risco mensal crítico
  if (worstProjection.projectionTone === 'critical') {
    return result(
      worstProjection,
      `Risco mensal em ${worstProjection.name}:`,
      `projeção de ${formatPercent(
        worstProjection.monthProjectionPercent,
        1,
      )} e déficit projetado de ${formatCompactCurrency(
        Math.max(0, -worstProjection.monthProjectionGap),
      )}. ${actionFor(worstProjection.id)}`,
    )
  }

  // 2. Lojas sem vendas
  if (mostZeros.zeroStores > 0) {
    const firstZero = priorities.find(
      (item) =>
        item.type === 'zero' &&
        item.coordinatorId === mostZeros.id,
    )

    return result(
      mostZeros,
      `${mostZeros.name} tem ${mostZeros.zeroStores} ${
        mostZeros.zeroStores === 1 ? 'loja zerada:' : 'lojas zeradas:'
      }`,
      firstZero
        ? `priorizar ${firstZero.title} para iniciar vendas hoje.`
        : 'priorizar o acionamento das carteiras sem vendas.',
    )
  }

  // 3. Projeção mensal em atenção
  if (worstProjection.projectionTone === 'attention') {
    return result(
      worstProjection,
      `Projeção em atenção — ${worstProjection.name}:`,
      `${formatPercent(
        worstProjection.monthProjectionPercent,
        1,
      )} projetado para o mês. ${actionFor(worstProjection.id)}`,
    )
  }

  // 4. Oportunidade de conversão
  if (topConversion) {
    const responsible = coordinators.find(
      (item) => item.id === topConversion.coordinatorId,
    )

    return result(
      responsible ?? worstDaily,
      'Conversão é a oportunidade imediata:',
      `${formatCompactCurrency(
        totalPending,
      )} em vendas aguardando pagamento. ${describeAction(
        topConversion,
      )}`,
    )
  }

  // 5. Meta diária ainda não atingida
  if (worstDaily.dailyAchievementPercent < 100) {
    return result(
      worstDaily,
      `Atenção à diária de ${worstDaily.name}:`,
      `${formatPercent(
        worstDaily.dailyAchievementPercent,
        1,
      )} realizado; faltam ${formatCompactCurrency(
        worstDaily.dailyGap,
      )} para a meta.`,
    )
  }

  // 6. Sem alertas nas regras acima
  return result(
    worstDaily,
    'Operação dentro dos parâmetros:',
    'diárias entregues, sem lojas zeradas e projeções mensais saudáveis.',
  )
}