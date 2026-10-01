import { useNavigate } from 'react-router-dom'
import { CompactBackButton } from '@/shared/components/navigation/CompactBackButton'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import {
  formatWorkOrderDate,
  getWorkOrderPriorityLabel,
  getWorkOrderStatusPresentation,
} from '../model/workOrderPresenter'
import type { WorkOrderDetailDto } from '../types/workOrder.types'

interface WorkOrderDetailHeaderProps {
  workOrder: WorkOrderDetailDto
}

export function WorkOrderDetailHeader({
  workOrder,
}: WorkOrderDetailHeaderProps) {
  const navigate = useNavigate()
  const status = getWorkOrderStatusPresentation(workOrder.status)

  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
      <div className="px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="work-orders" className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Expediente 360
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] font-bold tracking-tight text-slate-950">
                  {workOrder.workOrderNumber}
                </h1>
                <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
                  {status.label}
                </Badge>
              </div>
              <p className="mt-1 max-w-2xl truncate text-[10px] font-medium text-slate-600">
                {workOrder.source.title} · {workOrder.source.customerName}
              </p>
            </div>
          </div>

          <CompactBackButton
            label="Volver a órdenes"
            onClick={() => navigate('/work-orders')}
          />
        </div>

        <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
          <div className="py-1 sm:pr-4">
            <p className="text-[8px] font-medium text-slate-400">Prioridad</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-800">
              {getWorkOrderPriorityLabel(workOrder.priority)}
            </p>
          </div>
          <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
            <p className="text-[8px] font-medium text-slate-400">Cantidad</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-800">
              {workOrder.plannedQuantity ?? workOrder.source.quantity} piezas
            </p>
          </div>
          <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
            <p className="text-[8px] font-medium text-slate-400">Inicio planeado</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-800">
              {formatWorkOrderDate(workOrder.plannedStartDate)}
            </p>
          </div>
          <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:pl-4 sm:py-1">
            <p className="text-[8px] font-medium text-slate-400">Entrega acordada</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-800">
              {formatWorkOrderDate(workOrder.agreedDeliveryDate)}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
