import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  cancelDeliverySchema,
  type CancelDeliveryFormValues,
} from '../schemas/delivery.schemas'
import type { DeliveryDto } from '../types/delivery.types'

interface CancelDeliveryDialogProps {
  delivery: DeliveryDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CancelDeliveryFormValues) => Promise<boolean>
}

export function CancelDeliveryDialog({
  delivery,
  submitting,
  error,
  onClose,
  onSubmit,
}: CancelDeliveryDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelDeliveryFormValues>({
    resolver: zodResolver(cancelDeliverySchema),
    defaultValues: { reason: '' },
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
        aria-labelledby="cancel-delivery-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-red-700">
            Entrega #{delivery.id}
          </p>
          <h2
            id="cancel-delivery-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Cancelar entrega
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            La cantidad reservada volverá a quedar disponible para preparar otra
            entrega.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <TextareaField
            label="Motivo"
            maxLength={1000}
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
            {submitting ? 'Cancelando…' : 'Cancelar entrega'}
          </Button>
        </div>
      </form>
    </div>
  )
}
