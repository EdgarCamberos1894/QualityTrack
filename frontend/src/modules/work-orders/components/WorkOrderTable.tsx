import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
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
    <div className="divide-y divide-slate-100">
      {workOrders.map((workOrder) => {
        const status = getWorkOrderStatusPresentation(workOrder.status)

        return (
          <article
            key={workOrder.id}
            className="group grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-4 py-3 transition hover:bg-blue-50/30 sm:px-5 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(165px,0.85fr)_minmax(170px,0.9fr)_auto] md:items-center"
          >
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <SidebarNavIcon name="work-orders" className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <Link
                    to={`/work-orders/${workOrder.id}`}
                    className="block truncate text-[11px] font-semibold text-slate-950 transition group-hover:text-blue-700"
                  >
                    {workOrder.workOrderNumber}
                  </Link>
                  <p className="mt-0.5 truncate text-[8px] text-slate-400">
                    {workOrder.caseNumber} · {workOrder.requestNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end md:order-last">
              <OpenAction to={`/work-orders/${workOrder.id}`} />
            </div>

            <div className="col-span-2 min-w-0 md:col-span-1">
              <p className="truncate text-[9px] font-medium text-slate-700">
                {workOrder.customerName}
              </p>
              <p className="mt-0.5 truncate text-[7px] text-slate-400">
                {workOrder.approvedQuotationNumber} · Rev{' '}
                {workOrder.approvedQuotationRevision}
              </p>
            </div>

            <div className="col-span-2 min-w-0 md:col-span-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
                  {status.label}
                </Badge>
                <span className="text-[7px] font-medium text-slate-500">
                  {getWorkOrderPriorityLabel(workOrder.priority)}
                </span>
              </div>
              <p className="mt-1 text-[7px] text-slate-400">
                {workOrder.plannedQuantity ?? 'Sin definir'} piezas
              </p>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-3 md:col-span-1 md:block">
              <div>
                <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Inicio
                </p>
                <p className="mt-1 text-[8px] font-medium text-slate-700">
                  {formatWorkOrderDate(workOrder.plannedStartDate)}
                </p>
              </div>
              <div className="md:mt-1.5">
                <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Entrega
                </p>
                <p className="mt-1 text-[8px] font-medium text-slate-700">
                  {formatWorkOrderDate(workOrder.agreedDeliveryDate)}
                </p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function OpenAction({ to }: { to: string }) {
  return (
    <Link
      to={to}
      className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      Abrir
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
  )
}
