import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import { useDeliveries } from '../hooks/useDeliveries'
import { useWorkOrders } from '../hooks/useWorkOrders'
import {
  formatDeliveryDateTime,
  getAvailableDeliveryQuantity,
  getDeliveryStatusPresentation,
  isDeliveredToday,
} from '../model/deliveryPresenter'
import type { DeliveryDto, DeliveryQueueItem } from '../types/delivery.types'
import type { WorkOrderDto } from '../types/workOrder.types'

function buildQueue(
  workOrders: WorkOrderDto[],
  deliveries: DeliveryDto[],
): DeliveryQueueItem[] {
  const workOrderById = new Map(
    workOrders.map((workOrder) => [workOrder.id, workOrder]),
  )
  const deliveriesByWorkOrder = new Map<number, DeliveryDto[]>()

  for (const delivery of deliveries) {
    const current = deliveriesByWorkOrder.get(delivery.workOrderId) ?? []
    current.push(delivery)
    deliveriesByWorkOrder.set(delivery.workOrderId, current)
  }

  const readyItems = workOrders
    .filter((workOrder) => workOrder.status === 'READY_FOR_DELIVERY')
    .map((workOrder) => {
      const workOrderDeliveries = deliveriesByWorkOrder.get(workOrder.id) ?? []
      const plannedQuantity = workOrder.plannedQuantity ?? 0

      return {
        workOrderId: workOrder.id,
        workOrderNumber: workOrder.workOrderNumber,
        workOrderStatus: workOrder.status,
        customerName: workOrder.customerName,
        plannedQuantity,
        availableQuantity: getAvailableDeliveryQuantity(
          workOrder.plannedQuantity,
          workOrderDeliveries,
        ),
        delivery: null,
      } satisfies DeliveryQueueItem
    })
    .filter((item) => item.availableQuantity > 0)

  const deliveryItems = deliveries.map((delivery) => {
    const workOrder = workOrderById.get(delivery.workOrderId)

    return {
      workOrderId: delivery.workOrderId,
      workOrderNumber: delivery.workOrderNumber,
      workOrderStatus: workOrder?.status ?? 'READY_FOR_DELIVERY',
      customerName: workOrder?.customerName ?? 'Cliente',
      plannedQuantity: workOrder?.plannedQuantity ?? delivery.quantity,
      availableQuantity: 0,
      delivery,
    } satisfies DeliveryQueueItem
  })

  const statusWeight = {
    PENDING: 0,
    DISPATCHED: 1,
    DELIVERED: 2,
    CANCELLED: 3,
  } as const

  return [...readyItems, ...deliveryItems].sort((left, right) => {
    if (!left.delivery && right.delivery) return -1
    if (left.delivery && !right.delivery) return 1
    if (!left.delivery || !right.delivery) return 0

    return (
      statusWeight[left.delivery.status] - statusWeight[right.delivery.status]
    )
  })
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-5 py-4">
      <p className="text-[10px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
    </div>
  )
}

export function DeliveriesPage() {
  const deliveriesQuery = useDeliveries()
  const workOrdersQuery = useWorkOrders()

  const queue = useMemo(
    () => buildQueue(workOrdersQuery.data ?? [], deliveriesQuery.data ?? []),
    [deliveriesQuery.data, workOrdersQuery.data],
  )

  if (deliveriesQuery.isPending || workOrdersQuery.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando cola de entregas…" />
      </PageContainer>
    )
  }

  if (deliveriesQuery.isError || workOrdersQuery.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={deliveriesQuery.error ?? workOrdersQuery.error}
          title="No pudimos cargar Entregas"
        />
      </PageContainer>
    )
  }

  const deliveries = deliveriesQuery.data
  const readyCount = queue.filter((item) => item.delivery === null).length
  const inTransitCount = deliveries.filter(
    (delivery) => delivery.status === 'DISPATCHED',
  ).length
  const deliveredTodayCount = deliveries.filter(isDeliveredToday).length

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operación"
        title="Entregas"
        description="Órdenes listas para despacho y entregas actualmente en tránsito."
      />

      <Card className="grid overflow-hidden sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
        <Metric label="Listas para preparar" value={readyCount} />
        <Metric label="En tránsito" value={inTransitCount} />
        <Metric label="Entregadas hoy" value={deliveredTodayCount} />
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-950">
            Cola logística
          </h2>
          <p className="mt-1 text-[10px] text-slate-500">
            Se permiten entregas parciales. La OT solo cierra cuando la cantidad
            recibida acumulada cubre planned_quantity.
          </p>
        </div>

        {queue.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No hay entregas ni órdenes listas para despacho.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((item) => {
              const delivery = item.delivery
              const status = delivery
                ? getDeliveryStatusPresentation(delivery.status)
                : null

              return (
                <article
                  key={
                    delivery
                      ? `delivery-${delivery.id}`
                      : `ready-${item.workOrderId}`
                  }
                  className="grid gap-4 px-5 py-4 hover:bg-slate-50 @4xl/page:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)_180px_140px]"
                >
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500">
                      {delivery
                        ? `Entrega #${delivery.id} · ${item.workOrderNumber}`
                        : item.workOrderNumber}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-slate-950">
                      {item.customerName}
                    </h3>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {delivery
                        ? `${delivery.quantity} piezas · ${delivery.deliveryMethod}`
                        : `${item.availableQuantity} / ${item.plannedQuantity} disponibles`}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-slate-400">
                      Estado
                    </p>
                    <div className="mt-2">
                      {status ? (
                        <Badge tone={status.tone}>{status.label}</Badge>
                      ) : (
                        <Badge tone="success">Lista para entrega</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-slate-400">
                      Movimiento
                    </p>
                    <p className="mt-2 text-[10px] leading-5 text-slate-700">
                      {delivery?.status === 'DISPATCHED'
                        ? formatDeliveryDateTime(delivery.dispatchedAt)
                        : delivery?.status === 'DELIVERED'
                          ? formatDeliveryDateTime(delivery.deliveredAt)
                          : delivery?.status === 'CANCELLED'
                            ? formatDeliveryDateTime(delivery.cancelledAt)
                            : delivery
                              ? 'Pendiente de despacho'
                              : 'Pendiente de preparar'}
                    </p>
                  </div>

                  <div className="flex items-center justify-start @4xl/page:justify-end">
                    <Link
                      to={`/work-orders/${item.workOrderId}?tab=delivery`}
                      className="inline-flex h-10 min-w-28 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      {delivery?.status === 'PENDING'
                        ? 'Despachar'
                        : delivery?.status === 'DISPATCHED'
                          ? 'Ver'
                          : delivery
                            ? 'Ver'
                            : 'Preparar'}
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </Card>
    </PageContainer>
  )
}
