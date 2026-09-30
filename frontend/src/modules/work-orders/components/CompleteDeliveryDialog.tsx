import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  completeDeliverySchema,
  type CompleteDeliveryFormValues,
} from '../schemas/delivery.schemas'
import type { DeliveryDto } from '../types/delivery.types'

export interface DeliveryEvidenceOption {
  id: number
  label: string
}

interface CompleteDeliveryDialogProps {
  delivery: DeliveryDto | null
  evidenceOptions: DeliveryEvidenceOption[]
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CompleteDeliveryFormValues) => Promise<boolean>
}

function currentLocalDateTime(): string {
  const date = new Date()
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export function CompleteDeliveryDialog({
  delivery,
  evidenceOptions,
  submitting,
  error,
  onClose,
  onSubmit,
}: CompleteDeliveryDialogProps) {
  const [dateError, setDateError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompleteDeliveryFormValues>({
    resolver: zodResolver(completeDeliverySchema),
    defaultValues: {
      receivedByName: '',
      deliveredAt: currentLocalDateTime(),
      evidenceDocumentVersionId: '',
    },
  })

  useEffect(() => {
    if (!delivery) return
    reset({
      receivedByName: '',
      deliveredAt: currentLocalDateTime(),
      evidenceDocumentVersionId: delivery.evidenceDocumentVersionId
        ? String(delivery.evidenceDocumentVersionId)
        : '',
    })
  }, [delivery, reset])

  if (!delivery) return null

  const close = () => {
    reset()
    setDateError(null)
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    setDateError(null)
    const deliveredAt = new Date(values.deliveredAt)
    const dispatchedAt = delivery.dispatchedAt
      ? new Date(delivery.dispatchedAt)
      : null

    if (Number.isNaN(deliveredAt.getTime()) || deliveredAt > new Date()) {
      setDateError('La fecha de entrega debe ser válida y no puede ser futura.')
      return
    }

    if (dispatchedAt && deliveredAt < dispatchedAt) {
      setDateError('La entrega no puede registrarse antes del despacho.')
      return
    }

    if (await onSubmit(values)) close()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-delivery-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
            Entrega #{delivery.id}
          </p>
          <h2
            id="complete-delivery-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Registrar recepción
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            La OT solo cerrará cuando el acumulado DELIVERED alcance la cantidad
            planificada.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <TextField
            label="Recibido por"
            maxLength={160}
            error={errors.receivedByName?.message}
            {...register('receivedByName')}
          />
          <TextField
            label="Fecha real de entrega"
            type="datetime-local"
            error={errors.deliveredAt?.message}
            {...register('deliveredAt')}
          />

          <div>
            <label
              htmlFor="delivery-evidence"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Evidencia POD (opcional)
            </label>
            <select
              id="delivery-evidence"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              {...register('evidenceDocumentVersionId')}
            >
              <option value="">Sin evidencia documental</option>
              {evidenceOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {dateError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {dateError}
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
            {submitting ? 'Registrando…' : 'Confirmar entrega'}
          </Button>
        </div>
      </form>
    </div>
  )
}
