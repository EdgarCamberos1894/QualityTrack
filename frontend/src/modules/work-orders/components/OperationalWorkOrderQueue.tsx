import { Link } from 'react-router-dom'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import {
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
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-[10px] leading-5 text-slate-500">
          {description}
        </p>
      </div>

      {workOrders.length === 0 ? (
        <div className="p-5">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {workOrders.map((workOrder) => {
            const status = getWorkOrderStatusPresentation(workOrder.status)

            return (
              <article
                key={workOrder.id}
                className="grid gap-4 px-5 py-4 transition hover:bg-slate-50 @4xl/page:grid-cols-[minmax(0,1.5fr)_minmax(180px,0.8fr)_140px_150px]"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500">
                    {workOrder.workOrderNumber}
                  </p>
                  <h3 className="mt-1 truncate text-sm font-semibold text-slate-950">
                    {workOrder.caseNumber}
                  </h3>
                  <p className="mt-1 truncate text-[10px] text-slate-500">
                    {workOrder.customerName}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wide text-slate-400">
                    Estado
                  </p>
                  <div className="mt-2">
                    <Badge tone={status.tone} className="text-[10px]">
                      {status.label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wide text-slate-400">
                    Prioridad
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-800">
                    {getWorkOrderPriorityLabel(workOrder.priority)}
                  </p>
                  <p className="mt-1 text-[9px] text-slate-500">
                    {workOrder.plannedQuantity ?? 'Sin cantidad'} piezas
                  </p>
                </div>

                <div className="flex items-center justify-start @4xl/page:justify-end">
                  <Link
                    to={`/work-orders/${workOrder.id}?tab=${tab}`}
                    className="inline-flex h-10 min-w-32 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    {getActionLabel(workOrder)}
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </Card>
  )
}
