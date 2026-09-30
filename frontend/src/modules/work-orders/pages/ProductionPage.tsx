import { useMemo } from 'react'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Card } from '@/shared/components/ui/Card'
import { OperationalWorkOrderQueue } from '../components/OperationalWorkOrderQueue'
import { useWorkOrders } from '../hooks/useWorkOrders'
import type { WorkOrderDto, WorkOrderPriority } from '../types/workOrder.types'

const priorityWeight: Record<WorkOrderPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
}

function sortProductionQueue(workOrders: WorkOrderDto[]): WorkOrderDto[] {
  return [...workOrders].sort((left, right) => {
    const statusDifference =
      (left.status === 'IN_PRODUCTION' ? 0 : 1) -
      (right.status === 'IN_PRODUCTION' ? 0 : 1)

    if (statusDifference !== 0) return statusDifference

    return priorityWeight[left.priority] - priorityWeight[right.priority]
  })
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'blue' | 'teal' | 'amber'
}) {
  const valueClass = {
    blue: 'text-blue-600',
    teal: 'text-teal-700',
    amber: 'text-amber-700',
  }[tone]

  return (
    <div className="px-5 py-4">
      <p className="text-[10px] font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${valueClass}`}>{value}</p>
    </div>
  )
}

export function ProductionPage() {
  const query = useWorkOrders()

  const queue = useMemo(
    () =>
      sortProductionQueue(
        (query.data ?? []).filter(
          (workOrder) =>
            workOrder.status === 'READY_FOR_PRODUCTION' ||
            workOrder.status === 'IN_PRODUCTION',
        ),
      ),
    [query.data],
  )

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando cola de producción…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState error={query.error} title="No pudimos cargar Producción" />
      </PageContainer>
    )
  }

  const ready = queue.filter(
    (workOrder) => workOrder.status === 'READY_FOR_PRODUCTION',
  ).length
  const inProduction = queue.filter(
    (workOrder) => workOrder.status === 'IN_PRODUCTION',
  ).length

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operación"
        title="Producción"
        description="Órdenes liberadas y trabajo actualmente en ejecución."
      />

      <Card className="grid overflow-hidden sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
        <Metric label="Listas para iniciar" value={ready} tone="blue" />
        <Metric label="En producción" value={inProduction} tone="teal" />
        <Metric label="Total en cola" value={queue.length} tone="amber" />
      </Card>

      <OperationalWorkOrderQueue
        title="Cola de producción"
        description="Prioridad, estado y cantidad visibles. La ejecución detallada se gestiona dentro de cada orden."
        workOrders={queue}
        tab="production"
        emptyTitle="Sin trabajo pendiente de producción"
        emptyDescription="Las órdenes aparecerán aquí cuando su routing de producción sea liberado."
        getActionLabel={(workOrder) =>
          workOrder.status === 'IN_PRODUCTION' ? 'Continuar' : 'Iniciar'
        }
      />
    </PageContainer>
  )
}
