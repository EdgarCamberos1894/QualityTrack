import { Link } from 'react-router-dom'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import {
  formatWorkOrderDate,
  getWorkOrderPriorityLabel,
  getWorkOrderStatusPresentation,
} from '../model/workOrderPresenter'
import type { WorkOrderDetailTab, WorkOrderDto } from '../types/workOrder.types'

interface OperationalWorkOrderQueueProps {
  title: string
  description: string
  workOrders: WorkOrderDto[]
  tab: WorkOrderDetailTab
  emptyTitle: string
  emptyDescription: string
  getActionLabel: (workOrder: WorkOrderDto) => string
}

export function OperationalWorkOrderQueue({
  title,
  description,
  workOrders,
  tab,
  emptyTitle,
  emptyDescription,
  getActionLabel,
}: OperationalWorkOrderQueueProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
      <div className="flex flex-col gap-2 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Cola operativa
          </p>
          <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
            {title}
          </h2>
          <p className="mt-0.5 max-w-2xl text-[8px] leading-4 text-slate-400">
            {description}
          </p>
        </div>
        <span className="text-[8px] font-medium text-slate-400">
          {workOrders.length} órdenes
        </span>
      </div>

      {workOrders.length === 0 ? (
        <div className="p-4">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {workOrders.map((workOrder) => {
            const status = getWorkOrderStatusPresentation(workOrder.status)

            return (
              <article
                key={workOrder.id}
                className="grid gap-3 px-4 py-3 transition hover:bg-blue-50/25 sm:px-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(150px,0.7fr)_120px_minmax(150px,0.75fr)_110px]"
              >
                <div className="min-w-0">
                  <Link
                    to={`/work-orders/${workOrder.id}?tab=${tab}`}
                    className="truncate text-[11px] font-semibold text-slate-950 transition hover:text-blue-700"
                  >
                    {workOrder.workOrderNumber}
                  </Link>
                  <p className="mt-0.5 truncate text-[9px] font-medium text-slate-700">
                    {workOrder.customerName}
                  </p>
                  <p className="mt-0.5 truncate text-[8px] text-slate-400">
                    {workOrder.caseNumber} · {workOrder.requestNumber}
                  </p>
                </div>

                <div className="self-center">
                  <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                    Estado
                  </p>
                  <div className="mt-1">
                    <Badge tone={status.tone} className="px-2 py-0.5 text-[7px]">
                      {status.label}
                    </Badge>
                  </div>
                </div>

                <div className="self-center">
                  <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                    Prioridad
                  </p>
                  <p className="mt-1 text-[9px] font-semibold text-slate-700">
                    {getWorkOrderPriorityLabel(workOrder.priority)}
                  </p>
                  <p className="mt-0.5 text-[7px] text-slate-400">
                    {workOrder.plannedQuantity ?? 'Sin cantidad'} piezas
                  </p>
                </div>

                <div className="self-center">
                  <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                    Compromiso
                  </p>
                  <p className="mt-1 text-[9px] font-medium text-slate-700">
                    {formatWorkOrderDate(workOrder.agreedDeliveryDate)}
                  </p>
                  <p className="mt-0.5 text-[7px] text-slate-400">
                    Inicio {formatWorkOrderDate(workOrder.plannedStartDate)}
                  </p>
                </div>

                <div className="flex items-center justify-start lg:justify-end">
                  <Link
                    to={`/work-orders/${workOrder.id}?tab=${tab}`}
                    className="inline-flex h-7 min-w-[88px] items-center justify-center gap-1 rounded-lg bg-blue-600 px-2.5 text-[8px] font-semibold text-white transition hover:bg-blue-700"
                  >
                    {getActionLabel(workOrder)}
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
  )
}
