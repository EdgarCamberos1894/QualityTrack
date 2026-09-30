import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  cancelQuotationSchema,
  type CancelQuotationFormValues,
} from '../schemas/quotationCancellation.schema'
import type { QuotationDetailDto } from '../types/quotation.types'

interface CancelQuotationDialogProps {
  quotation: QuotationDetailDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CancelQuotationFormValues) => Promise<boolean>
}

export function CancelQuotationDialog({
  quotation,
  submitting,
  error,
  onClose,
  onSubmit,
}: CancelQuotationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelQuotationFormValues>({
    resolver: zodResolver(cancelQuotationSchema),
    defaultValues: { reason: '' },
  })

  if (!quotation) return null

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
        aria-labelledby="cancel-quotation-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-red-700">
            {quotation.quotationNumber} · revisión {quotation.revision}
          </p>
          <h2
            id="cancel-quotation-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Cancelar cotización
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {quotation.status === 'SENT'
              ? 'El cliente dejará de poder aprobar o rechazar esta revisión. El historial se conserva y después podrás crear una nueva revisión.'
              : 'El borrador quedará cerrado y conservará su historial. Después podrás crear una nueva revisión si el flujo lo requiere.'}
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
            {submitting ? 'Cancelando…' : 'Cancelar cotización'}
          </Button>
        </div>
      </form>
    </div>
  )
}
