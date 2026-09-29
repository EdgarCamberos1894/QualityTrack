import { Card } from '@/shared/components/ui/Card'
import {
  formatWorkOrderDate,
  getWorkOrderPriorityLabel,
} from '../model/workOrderPresenter'
import type { WorkOrderDetailDto } from '../types/workOrder.types'

interface WorkOrderSummaryProps {
  workOrder: WorkOrderDetailDto
}

function DataItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-xs font-medium text-slate-800">{value}</dd>
    </div>
  )
}

export function WorkOrderSummary({ workOrder }: WorkOrderSummaryProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-950">
          Planeación operativa
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
          <DataItem
            label="Cantidad planeada"
            value={workOrder.plannedQuantity ?? 'Sin definir'}
          />
          <DataItem
            label="Prioridad"
            value={getWorkOrderPriorityLabel(workOrder.priority)}
          />
          <DataItem
            label="Inicio planeado"
            value={formatWorkOrderDate(workOrder.plannedStartDate)}
          />
          <DataItem
            label="Fin planeado"
            value={formatWorkOrderDate(workOrder.plannedEndDate)}
          />
          <DataItem
            label="Entrega acordada"
            value={formatWorkOrderDate(workOrder.agreedDeliveryDate)}
          />
          <DataItem
            label="Documentos fijados"
            value={workOrder.pinnedDocuments.length}
          />
        </dl>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-950">
          Origen comercial
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
          <DataItem label="Cliente" value={workOrder.source.customerName} />
          <DataItem label="Expediente" value={workOrder.source.caseNumber} />
          <DataItem label="Solicitud" value={workOrder.source.requestNumber} />
          <DataItem
            label="Cantidad solicitada"
            value={workOrder.source.quantity}
          />
          <DataItem
            label="Cotización"
            value={workOrder.agreement.quotationNumber}
          />
          <DataItem
            label="Revisión aprobada"
            value={workOrder.agreement.revision}
          />
        </dl>
      </Card>
    </div>
  )
}
