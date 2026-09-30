import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { useCreateWorkOrder } from '../hooks/useCreateWorkOrder'
import { getWorkOrderStatusPresentation } from '../model/workOrderPresenter'
import type { CreateWorkOrderFormValues } from '../schemas/createWorkOrder.schema'
import type {
  WorkOrderDetailDto,
  WorkOrderDto,
} from '../types/workOrder.types'
import { CreateWorkOrderDialog } from './CreateWorkOrderDialog'

interface WorkOrderCreationPanelProps {
  caseId: number
  quotationNumber: string
  quotationRevision: number
  customerName: string
  plannedQuantity: number
  agreedDeliveryDate: string | null
  canCreate: boolean
  existingWorkOrder?: WorkOrderDto
  onCreated: (workOrder: WorkOrderDetailDto) => void
}

export function WorkOrderCreationPanel({
  caseId,
  quotationNumber,
  quotationRevision,
  customerName,
  plannedQuantity,
  agreedDeliveryDate,
  canCreate,
  existingWorkOrder,
  onCreated,
}: WorkOrderCreationPanelProps) {
  const [open, setOpen] = useState(false)
  const mutation = useCreateWorkOrder(caseId)

  const create = async (values: CreateWorkOrderFormValues) => {
    try {
      const workOrder = await mutation.mutateAsync(values)
      setOpen(false)
      onCreated(workOrder)
      return true
    } catch {
      return false
    }
  }

  if (existingWorkOrder) {
    const status = getWorkOrderStatusPresentation(existingWorkOrder.status)

    return (
      <section className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
            Orden de trabajo creada
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            {existingWorkOrder.workOrderNumber} · {status.label}
          </p>
          <p className="mt-1 text-[10px] text-slate-600">
            La revisión aprobada ya fue convertida en un paquete operativo.
          </p>
        </div>
        <Link
          to={`/work-orders/${existingWorkOrder.id}`}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          Abrir orden
        </Link>
      </section>
    )
  }

  return (
    <>
      <section className="flex flex-col gap-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-violet-700">
            Siguiente paso · Orden de trabajo
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-950">
            El compromiso comercial ya está aprobado
          </p>
          <p className="mt-1 text-[10px] leading-5 text-slate-600">
            Crea la OT explícitamente para fijar la revisión aprobada y comenzar
            la preparación operativa.
          </p>
        </div>

        {canCreate ? (
          <Button onClick={() => setOpen(true)}>
            Crear orden de trabajo
          </Button>
        ) : (
          <p className="max-w-xs text-[10px] leading-5 text-slate-500">
            Solo ADMIN o COMMERCIAL pueden crear la orden de trabajo.
          </p>
        )}
      </section>

      <CreateWorkOrderDialog
        open={open}
        quotationNumber={quotationNumber}
        quotationRevision={quotationRevision}
        customerName={customerName}
        plannedQuantity={plannedQuantity}
        agreedDeliveryDate={agreedDeliveryDate}
        submitting={mutation.isPending}
        error={mutation.error}
        onClose={() => {
          mutation.reset()
          setOpen(false)
        }}
        onSubmit={create}
      />
    </>
  )
}
