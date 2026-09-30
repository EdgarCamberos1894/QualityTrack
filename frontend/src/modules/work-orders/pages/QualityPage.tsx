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

function sortQualityQueue(workOrders: WorkOrderDto[]): WorkOrderDto[] {
  const statusWeight = {
    QUALITY_HOLD: 0,
    REWORK_IN_PROGRESS: 1,
    QUALITY_PENDING: 2,
  } as const

  return [...workOrders].sort((left, right) => {
    const statusDifference =
      statusWeight[left.status as keyof typeof statusWeight] -
      statusWeight[right.status as keyof typeof statusWeight]

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
  tone: 'blue' | 'red' | 'amber'
}) {
  const valueClass = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    amber: 'text-amber-700',
  }[tone]

  return (
    <div className="px-5 py-4">
      <p className="text-[10px] font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${valueClass}`}>{value}</p>
    </div>
  )
}

export function QualityPage() {
  const query = useWorkOrders()

  const queue = useMemo(
    () =>
      sortQualityQueue(
        (query.data ?? []).filter(
          (workOrder) =>
            workOrder.status === 'QUALITY_PENDING' ||
            workOrder.status === 'QUALITY_HOLD' ||
            workOrder.status === 'REWORK_IN_PROGRESS',
        ),
      ),
    [query.data],
  )

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando cola de calidad…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState error={query.error} title="No pudimos cargar Calidad" />
      </PageContainer>
    )
  }

  const pending = queue.filter(
    (workOrder) => workOrder.status === 'QUALITY_PENDING',
  ).length
  const onHold = queue.filter(
    (workOrder) => workOrder.status === 'QUALITY_HOLD',
  ).length
  const rework = queue.filter(
    (workOrder) => workOrder.status === 'REWORK_IN_PROGRESS',
  ).length

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operación"
        title="Calidad"
        description="Órdenes pendientes de inspección, retenidas por no conformidad o actualmente en retrabajo."
      />

      <Card className="grid overflow-hidden sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
        <Metric label="Pendientes" value={pending} tone="blue" />
        <Metric label="Retenidas por calidad" value={onHold} tone="red" />
        <Metric label="En retrabajo" value={rework} tone="amber" />
      </Card>

      <OperationalWorkOrderQueue
        title="Cola de calidad"
        description="La inspección y las no conformidades pertenecen a la OT. Abre la orden para iniciar, continuar o resolver el control."
        workOrders={queue}
        tab="quality"
        emptyTitle="Sin trabajo pendiente de calidad"
        emptyDescription="Las órdenes aparecerán aquí al ser enviadas a Calidad o cuando una NC mantenga la orden retenida."
        getActionLabel={(workOrder) => {
          if (workOrder.status === 'QUALITY_HOLD') return 'Resolver'
          if (workOrder.status === 'REWORK_IN_PROGRESS') return 'Continuar'
          return 'Revisar'
        }}
      />
    </PageContainer>
  )
}
