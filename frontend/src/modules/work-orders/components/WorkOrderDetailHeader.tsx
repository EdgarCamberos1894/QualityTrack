import { Badge } from '@/shared/components/ui/Badge'
import { getWorkOrderStatusPresentation } from '../model/workOrderPresenter'
import type { WorkOrderDetailDto } from '../types/workOrder.types'

interface WorkOrderDetailHeaderProps {
  workOrder: WorkOrderDetailDto
}

export function WorkOrderDetailHeader({
  workOrder,
}: WorkOrderDetailHeaderProps) {
  const status = getWorkOrderStatusPresentation(workOrder.status)

  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[10px] text-slate-500">
          Órdenes de trabajo / Expediente 360
        </p>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight text-slate-950">
          {workOrder.workOrderNumber}
        </h1>
        <p className="mt-1 text-[13px] font-medium text-slate-700">
          {workOrder.source.title} · {workOrder.source.customerName}
        </p>
      </div>

      <div className="sm:text-right">
        <Badge tone={status.tone} className="px-4 py-1.5 text-[10px]">
          {status.label}
        </Badge>
        <p className="mt-2 text-[9px] text-slate-500">
          Estado de dominio · {workOrder.status}
        </p>
      </div>
    </div>
  )
}
