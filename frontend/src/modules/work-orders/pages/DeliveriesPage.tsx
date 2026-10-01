import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
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

function movementLabel(delivery: DeliveryDto | null): string {
  if (!delivery) return 'Pendiente de preparar'
  if (delivery.status === 'DISPATCHED') {
    return formatDeliveryDateTime(delivery.dispatchedAt)
  }
  if (delivery.status === 'DELIVERED') {
    return formatDeliveryDateTime(delivery.deliveredAt)
  }
  if (delivery.status === 'CANCELLED') {
    return formatDeliveryDateTime(delivery.cancelledAt)
  }
  return 'Pendiente de despacho'
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
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando cola de entregas…" />
      </PageContainer>
    )
  }

  if (deliveriesQuery.isError || workOrdersQuery.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={deliveriesQuery.error ?? workOrdersQuery.error}
          title="No pudimos cargar Entregas"
        />
      </PageContainer>
    )
  }

  const deliveries = deliveriesQuery.data
  const readyCount = queue.filter((item) => item.delivery === null).length
  const pendingCount = deliveries.filter(
    (delivery) => delivery.status === 'PENDING',
  ).length
  const inTransitCount = deliveries.filter(
    (delivery) => delivery.status === 'DISPATCHED',
  ).length
  const deliveredTodayCount = deliveries.filter(isDeliveredToday).length

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="deliveries" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Operación
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Entregas
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                Gestiona órdenes listas para despacho, entregas preparadas y
                movimientos en tránsito hasta completar la cantidad comprometida.
              </p>
            </div>
          </div>

          <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
            <Metric label="Listas para preparar" value={readyCount} />
            <Metric label="Preparadas" value={pendingCount} separated />
            <Metric
              label="En tránsito"
              value={inTransitCount}
              valueClassName="text-blue-700"
              separated
            />
            <Metric
              label="Entregadas hoy"
              value={deliveredTodayCount}
              valueClassName="text-emerald-700"
              separated
              last
            />
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
        <div className="flex flex-col gap-2 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Cola logística
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Despachos y entregas
            </h2>
            <p className="mt-0.5 max-w-2xl text-[8px] leading-4 text-slate-400">
              Se permiten entregas parciales. La OT se cierra cuando la cantidad
              recibida acumulada cubre la cantidad planificada.
            </p>
          </div>
          <span className="text-[8px] font-medium text-slate-400">
            {queue.length} movimientos
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="px-5 py-7 text-center">
            <p className="text-[10px] font-semibold text-slate-700">
              No hay entregas ni órdenes listas para despacho
            </p>
            <p className="mt-1 text-[8px] text-slate-400">
              Las órdenes aparecerán aquí cuando Calidad las libere para entrega.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((item) => {
              const delivery = item.delivery
              const status = delivery
                ? getDeliveryStatusPresentation(delivery.status)
                : null

              const actionLabel =
                delivery?.status === 'PENDING'
                  ? 'Despachar'
                  : delivery
                    ? 'Ver'
                    : 'Preparar'

              return (
                <article
                  key={
                    delivery
                      ? `delivery-${delivery.id}`
                      : `ready-${item.workOrderId}`
                  }
                  className="grid gap-3 px-4 py-3 transition hover:bg-blue-50/25 sm:px-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(150px,0.7fr)_minmax(150px,0.75fr)_110px]"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/work-orders/${item.workOrderId}?tab=delivery`}
                      className="truncate text-[11px] font-semibold text-slate-950 transition hover:text-blue-700"
                    >
                      {delivery
                        ? `Entrega #${delivery.id} · ${item.workOrderNumber}`
                        : item.workOrderNumber}
                    </Link>
                    <p className="mt-0.5 truncate text-[9px] font-medium text-slate-700">
                      {item.customerName}
                    </p>
                    <p className="mt-0.5 truncate text-[8px] text-slate-400">
                      {delivery
                        ? `${delivery.quantity} piezas · ${delivery.deliveryMethod}`
                        : `${item.availableQuantity} de ${item.plannedQuantity} piezas disponibles`}
                    </p>
                  </div>

                  <div className="self-center">
                    <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                      Estado
                    </p>
                    <div className="mt-1">
                      {status ? (
                        <Badge
                          tone={status.tone}
                          className="px-2 py-0.5 text-[7px]"
                        >
                          {status.label}
                        </Badge>
                      ) : (
                        <Badge
                          tone="success"
                          className="px-2 py-0.5 text-[7px]"
                        >
                          Lista para entrega
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="self-center">
                    <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                      Movimiento
                    </p>
                    <p className="mt-1 text-[9px] font-medium text-slate-700">
                      {movementLabel(delivery)}
                    </p>
                    {delivery?.trackingNumber ? (
                      <p className="mt-0.5 truncate text-[7px] text-slate-400">
                        Guía {delivery.trackingNumber}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-start lg:justify-end">
                    <Link
                      to={`/work-orders/${item.workOrderId}?tab=delivery`}
                      className="inline-flex h-7 min-w-[88px] items-center justify-center gap-1 rounded-lg bg-blue-600 px-2.5 text-[8px] font-semibold text-white transition hover:bg-blue-700"
                    >
                      {actionLabel}
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 10h8" />
                        <path d="m11 7 3 3-3 3" />
                      </svg>
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </PageContainer>
  )
}

function Metric({
  label,
  value,
  valueClassName = 'text-slate-950',
  separated = false,
  last = false,
}: {
  label: string
  value: number
  valueClassName?: string
  separated?: boolean
  last?: boolean
}) {
  return (
    <div
      className={[
        'py-1',
        separated ? 'border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1' : 'sm:pr-4',
        last ? 'sm:pr-0' : '',
      ].join(' ')}
    >
      <p className="text-[8px] font-medium text-slate-400">{label}</p>
      <p className={`mt-0.5 text-[16px] font-bold ${valueClassName}`}>
        {value}
      </p>
    </div>
  )
}
