import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  dispatchDeliverySchema,
  type DispatchDeliveryFormValues,
} from '../schemas/delivery.schemas'
import type { DeliveryDto } from '../types/delivery.types'

interface DispatchDeliveryDialogProps {
  delivery: DeliveryDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: DispatchDeliveryFormValues) => Promise<boolean>
}

export function DispatchDeliveryDialog({
  delivery,
  submitting,
  error,
  onClose,
  onSubmit,
}: DispatchDeliveryDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DispatchDeliveryFormValues>({
    resolver: zodResolver(dispatchDeliverySchema),
    defaultValues: { carrier: '', trackingNumber: '' },
  })

  if (!delivery) return null

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
        aria-labelledby="dispatch-delivery-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">
            Despachar entrega #{delivery.id}
          </p>
          <h2
            id="dispatch-delivery-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Confirmar salida de planta
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            PENDING → DISPATCHED. La OT permanece READY_FOR_DELIVERY.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <TextField
            label="Transportista (opcional)"
            maxLength={120}
            error={errors.carrier?.message}
            {...register('carrier')}
          />
          <TextField
            label="Guía / tracking (opcional)"
            maxLength={160}
            error={errors.trackingNumber?.message}
            {...register('trackingNumber')}
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Despachando…' : 'Confirmar despacho'}
          </Button>
        </div>
      </form>
    </div>
  )
}
