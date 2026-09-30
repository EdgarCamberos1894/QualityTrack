import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  completeOperationExecutionSchema,
  type CompleteOperationExecutionFormValues,
} from '../schemas/production.schemas'
import type { OperationExecutionDto } from '../types/workOrder.types'

interface CompleteExecutionDialogProps {
  open: boolean
  execution: OperationExecutionDto | null
  plannedQuantity: number | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (
    values: CompleteOperationExecutionFormValues,
  ) => Promise<boolean>
}

export function CompleteExecutionDialog({
  open,
  execution,
  plannedQuantity,
  submitting,
  error,
  onClose,
  onSubmit,
}: CompleteExecutionDialogProps) {
  const [quantityError, setQuantityError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompleteOperationExecutionFormValues>({
    resolver: zodResolver(completeOperationExecutionSchema),
    defaultValues: {
      quantityProcessed: plannedQuantity ?? 1,
      quantityAccepted: plannedQuantity ?? 1,
      quantityRejected: 0,
      completionNotes: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      quantityProcessed: plannedQuantity ?? 1,
      quantityAccepted: plannedQuantity ?? 1,
      quantityRejected: 0,
      completionNotes: '',
    })
    setQuantityError(null)
  }, [open, plannedQuantity, reset])

  const processed = useWatch({ control, name: 'quantityProcessed' })
  const accepted = useWatch({ control, name: 'quantityAccepted' })
  const rejected = useWatch({ control, name: 'quantityRejected' })

  if (!open || !execution) return null

  const close = () => {
    reset()
    setQuantityError(null)
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    setQuantityError(null)

    if (values.quantityAccepted + values.quantityRejected !== values.quantityProcessed) {
      setQuantityError(
        'La cantidad procesada debe ser igual a aceptada + rechazada.',
      )
      return
    }

    if (await onSubmit(values)) {
      reset()
      setQuantityError(null)
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-execution-title"
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
            Finalizar ejecución
          </p>
          <h2
            id="complete-execution-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            {execution.operationCode} · {execution.operationName}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Registra el resultado real del intento #{execution.attemptNumber}.
          </p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Procesadas"
              type="number"
              min="1"
              error={errors.quantityProcessed?.message}
              {...register('quantityProcessed', { valueAsNumber: true })}
            />
            <TextField
              label="Aceptadas"
              type="number"
              min="0"
              error={errors.quantityAccepted?.message}
              {...register('quantityAccepted', { valueAsNumber: true })}
            />
            <TextField
              label="Rechazadas"
              type="number"
              min="0"
              error={errors.quantityRejected?.message}
              {...register('quantityRejected', { valueAsNumber: true })}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-600">
                Aceptadas + rechazadas
              </span>
              <span
                className={
                  accepted + rejected === processed
                    ? 'font-semibold text-emerald-700'
                    : 'font-semibold text-amber-700'
                }
              >
                {accepted + rejected} / {processed}
              </span>
            </div>
          </div>

          <TextareaField
            label="Notas de finalización"
            maxLength={2000}
            placeholder="Resultado, observaciones, desviaciones o condiciones encontradas…"
            error={errors.completionNotes?.message}
            {...register('completionNotes')}
          />

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
            {submitting ? 'Finalizando…' : 'Finalizar operación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
