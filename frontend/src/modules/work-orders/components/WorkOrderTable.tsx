import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import type { WorkOrderDto } from '../types/workOrder.types'
import {
  formatWorkOrderDate,
  getWorkOrderPriorityLabel,
  getWorkOrderStatusPresentation,
} from '../model/workOrderPresenter'

interface WorkOrderTableProps {
  workOrders: WorkOrderDto[]
}

export function WorkOrderTable({ workOrders }: WorkOrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            <th className="px-4 py-3">Orden</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Prioridad</th>
            <th className="px-4 py-3">Cantidad</th>
            <th className="px-4 py-3">Inicio</th>
            <th className="px-4 py-3">Entrega acordada</th>
            <th className="px-4 py-3 text-right">Acción</th>
          </tr>
        </thead>

        <tbody>
          {workOrders.map((workOrder) => {
            const status = getWorkOrderStatusPresentation(workOrder.status)

            return (
              <tr
                key={workOrder.id}
                className="border-b border-slate-100 text-xs text-slate-700 last:border-0 hover:bg-slate-50"
              >
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-950">
                    {workOrder.workOrderNumber}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {workOrder.caseNumber} · {workOrder.requestNumber}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-800">
                    {workOrder.customerName}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {workOrder.approvedQuotationNumber} · Rev{' '}
                    {workOrder.approvedQuotationRevision}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <Badge tone={status.tone} className="text-[10px]">
                    {status.label}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  {getWorkOrderPriorityLabel(workOrder.priority)}
                </td>
                <td className="px-4 py-4">
                  {workOrder.plannedQuantity ?? 'Sin definir'}
                </td>
                <td className="px-4 py-4">
                  {formatWorkOrderDate(workOrder.plannedStartDate)}
                </td>
                <td className="px-4 py-4">
                  {formatWorkOrderDate(workOrder.agreedDeliveryDate)}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    to={`/work-orders/${workOrder.id}`}
                    className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
