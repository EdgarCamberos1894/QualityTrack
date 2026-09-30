import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  attachDeliveryEvidenceSchema,
  type AttachDeliveryEvidenceFormValues,
} from '../schemas/delivery.schemas'
import type { DeliveryDto } from '../types/delivery.types'
import type { DeliveryEvidenceOption } from './CompleteDeliveryDialog'

interface DeliveryEvidenceDialogProps {
  delivery: DeliveryDto | null
  options: DeliveryEvidenceOption[]
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: AttachDeliveryEvidenceFormValues) => Promise<boolean>
}

export function DeliveryEvidenceDialog({
  delivery,
  options,
  submitting,
  error,
  onClose,
  onSubmit,
}: DeliveryEvidenceDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttachDeliveryEvidenceFormValues>({
    resolver: zodResolver(attachDeliveryEvidenceSchema),
    defaultValues: { documentVersionId: '' },
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
        aria-labelledby="delivery-evidence-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">
            Entrega #{delivery.id}
          </p>
          <h2
            id="delivery-evidence-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Vincular evidencia de entrega
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Solo se aceptan versiones de documentos DELIVERY_EVIDENCE del mismo
            expediente.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label
              htmlFor="evidence-version"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Documento
            </label>
            <select
              id="evidence-version"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              {...register('documentVersionId')}
            >
              <option value="">Selecciona una evidencia</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.documentVersionId ? (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.documentVersionId.message}
              </p>
            ) : null}
          </div>

          {options.length === 0 ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              El expediente todavía no tiene un documento DELIVERY_EVIDENCE.
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
          <Button type="submit" disabled={submitting || options.length === 0}>
            {submitting ? 'Vinculando…' : 'Vincular evidencia'}
          </Button>
        </div>
      </form>
    </div>
  )
}
