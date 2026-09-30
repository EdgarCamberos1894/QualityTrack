import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  cancelWorkOrderSchema,
  type CancelWorkOrderFormValues,
} from '../schemas/workOrderCancellation.schema'
import type { WorkOrderDetailDto } from '../types/workOrder.types'

interface CancelWorkOrderDialogProps {
  workOrder: WorkOrderDetailDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CancelWorkOrderFormValues) => Promise<boolean>
}

export function CancelWorkOrderDialog({
  workOrder,
  submitting,
  error,
  onClose,
  onSubmit,
}: CancelWorkOrderDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelWorkOrderFormValues>({
    resolver: zodResolver(cancelWorkOrderSchema),
    defaultValues: { reason: '' },
  })

  if (!workOrder) return null

  const close = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) close()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-work-order-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-red-700">
            {workOrder.workOrderNumber}
          </p>
          <h2
            id="cancel-work-order-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Cancelar orden de trabajo
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Esta acción también cancela el expediente asociado. Solo es posible
            mientras la orden siga en preparación y todavía no haya sido
            liberada a producción.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <TextareaField
            label="Motivo (opcional)"
            maxLength={2000}
            error={errors.reason?.message}
            {...register('reason')}
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Volver
          </Button>
          <Button variant="danger" type="submit" disabled={submitting}>
            {submitting ? 'Cancelando…' : 'Cancelar orden'}
          </Button>
        </div>
      </form>
    </div>
  )
}
