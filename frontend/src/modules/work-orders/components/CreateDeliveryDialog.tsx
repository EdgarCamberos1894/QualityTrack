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
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Entrega · Preparación
          </p>
          <h2
            id="create-delivery-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Preparar despacho
          </h2>
          <p className="mt-1 text-[9px] text-slate-500">
            {availableQuantity} piezas disponibles para reservar.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Cantidad"
              type="number"
              min="1"
              max={availableQuantity}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.quantity?.message}
              {...register('quantity', { valueAsNumber: true })}
            />
            <TextField
              label="Método"
              maxLength={80}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.deliveryMethod?.message}
              {...register('deliveryMethod')}
            />
          </div>

          <TextField
            label="Recibe"
            maxLength={160}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.destinationRecipientName?.message}
            {...register('destinationRecipientName')}
          />

          <TextareaField
            label="Dirección"
            maxLength={300}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-16 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none"
            error={errors.destinationAddress?.message}
            {...register('destinationAddress')}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Ciudad', 'destinationCity'],
              ['Estado', 'destinationState'],
              ['Código postal', 'destinationPostalCode'],
              ['País', 'destinationCountry'],
            ].map(([label, name]) => (
              <TextField
                key={name}
                label={label}
                maxLength={name === 'destinationPostalCode' ? 20 : 120}
                labelClassName="!mb-1.5 !text-[10px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={errors[name as keyof CreateDeliveryFormValues]?.message as string | undefined}
                {...register(name as keyof CreateDeliveryFormValues)}
              />
            ))}
          </div>

          <p className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-[8px] leading-4 text-blue-800">
            El destino se conserva como snapshot histórico de esta entrega.
          </p>

          {quantityError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[8px] leading-4 text-amber-800">
              {quantityError}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button variant="secondary" className="!h-7 !px-2.5 !text-[8px]" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" className="!h-7 !px-2.5 !text-[8px]" disabled={submitting}>
            {submitting ? 'Creando…' : 'Crear entrega'}
          </Button>
        </div>
      </form>
    </div>
  )
}
