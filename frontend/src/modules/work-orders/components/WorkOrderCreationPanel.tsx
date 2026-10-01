import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { useCreateWorkOrder } from '../hooks/useCreateWorkOrder'
import { getWorkOrderStatusPresentation } from '../model/workOrderPresenter'
import type { CreateWorkOrderFormValues } from '../schemas/createWorkOrder.schema'
import type { WorkOrderDetailDto, WorkOrderDto } from '../types/workOrder.types'
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
      <section className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-white px-3.5 py-3 shadow-[0_10px_28px_-26px_rgba(5,150,105,0.2)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-700">
            Siguiente etapa disponible
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-950">
            {existingWorkOrder.workOrderNumber} · {status.label}
          </p>
          <p className="mt-1 text-[8px] text-slate-500">
            La revisión aprobada ya está vinculada a una orden de trabajo.
          </p>
        </div>
        <Link
          to={`/work-orders/${existingWorkOrder.id}`}
          className="inline-flex h-7 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[8px] font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          Abrir orden
        </Link>
      </section>
    )
  }

  return (
    <>
      <section className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-white px-3.5 py-3 shadow-[0_10px_28px_-26px_rgba(37,99,235,0.2)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Siguiente etapa · Orden de trabajo
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-950">
            El compromiso comercial ya está aprobado
          </p>
          <p className="mt-1 text-[8px] leading-4 text-slate-500">
            Crea la OT para fijar esta revisión y comenzar la preparación operativa.
          </p>
        </div>

        {canCreate ? (
          <Button
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={() => setOpen(true)}
          >
            Crear orden de trabajo
          </Button>
        ) : (
          <p className="max-w-xs text-[8px] leading-4 text-slate-500">
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
