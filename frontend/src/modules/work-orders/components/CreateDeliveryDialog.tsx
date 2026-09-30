import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  createDeliverySchema,
  type CreateDeliveryFormValues,
} from '../schemas/delivery.schemas'

interface CreateDeliveryDialogProps {
  open: boolean
  availableQuantity: number
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CreateDeliveryFormValues) => Promise<boolean>
}

export function CreateDeliveryDialog({
  open,
  availableQuantity,
  submitting,
  error,
  onClose,
  onSubmit,
}: CreateDeliveryDialogProps) {
  const [quantityError, setQuantityError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDeliveryFormValues>({
    resolver: zodResolver(createDeliverySchema),
    defaultValues: {
      quantity: availableQuantity || 1,
      destinationRecipientName: '',
      destinationAddress: '',
      destinationCity: '',
      destinationState: '',
      destinationPostalCode: '',
      destinationCountry: 'México',
      deliveryMethod: 'LOCAL_DELIVERY',
    },
  })

  useEffect(() => {
    if (!open) return

    reset({
      quantity: availableQuantity || 1,
      destinationRecipientName: '',
      destinationAddress: '',
      destinationCity: '',
      destinationState: '',
      destinationPostalCode: '',
      destinationCountry: 'México',
      deliveryMethod: 'LOCAL_DELIVERY',
    })
  }, [availableQuantity, open, reset])

  if (!open) return null

  const close = () => {
    reset()
    setQuantityError(null)
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    setQuantityError(null)

    if (values.quantity > availableQuantity) {
      setQuantityError(
        `Solo hay ${availableQuantity} pieza${availableQuantity === 1 ? '' : 's'} disponibles para reservar.`,
      )
      return
    }

    if (await onSubmit(values)) close()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-delivery-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">
            Nueva entrega
          </p>
          <h2
            id="create-delivery-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Preparar despacho
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {availableQuantity} piezas disponibles. Crear la entrega no cambia
            todavía el estado de la OT.
          </p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Cantidad"
              type="number"
              min="1"
              max={availableQuantity}
              error={errors.quantity?.message}
              {...register('quantity', { valueAsNumber: true })}
            />
            <TextField
              label="Método"
              maxLength={80}
              error={errors.deliveryMethod?.message}
              {...register('deliveryMethod')}
            />
          </div>

          <TextField
            label="Recibe"
            maxLength={160}
            error={errors.destinationRecipientName?.message}
            {...register('destinationRecipientName')}
          />

          <TextareaField
            label="Dirección"
            maxLength={300}
            error={errors.destinationAddress?.message}
            {...register('destinationAddress')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Ciudad"
              maxLength={120}
              error={errors.destinationCity?.message}
              {...register('destinationCity')}
            />
            <TextField
              label="Estado"
              maxLength={120}
              error={errors.destinationState?.message}
              {...register('destinationState')}
            />
            <TextField
              label="Código postal"
              maxLength={20}
              error={errors.destinationPostalCode?.message}
              {...register('destinationPostalCode')}
            />
            <TextField
              label="País"
              maxLength={100}
              error={errors.destinationCountry?.message}
              {...register('destinationCountry')}
            />
          </div>

          <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] leading-5 text-blue-800">
            El destino se guarda como snapshot en la entrega. Cambios
            posteriores en los datos del cliente no alteran esta evidencia
            histórica.
          </p>

          {quantityError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {quantityError}
            </p>
          ) : null}

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
            {submitting ? 'Creando…' : 'Crear entrega'}
          </Button>
        </div>
      </form>
    </div>
  )
}
