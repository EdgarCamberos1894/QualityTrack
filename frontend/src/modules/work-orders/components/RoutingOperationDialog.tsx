import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  routingOperationSchema,
  type RoutingOperationFormValues,
} from '../schemas/workOrderPreparation.schemas'
import type { RoutingOperationDto } from '../types/workOrder.types'

interface RoutingOperationDialogProps {
  open: boolean
  operation?: RoutingOperationDto
  nextSequence: number
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: RoutingOperationFormValues) => Promise<boolean>
}

export function RoutingOperationDialog({
  open,
  operation,
  nextSequence,
  submitting,
  error,
  onClose,
  onSubmit,
}: RoutingOperationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoutingOperationFormValues>({
    resolver: zodResolver(routingOperationSchema),
    defaultValues: {
      sequenceNumber: operation?.sequenceNumber ?? nextSequence,
      code: operation?.code ?? '',
      name: operation?.name ?? '',
      instructions: operation?.instructions ?? '',
      estimatedMinutes: operation?.estimatedMinutes ?? 30,
    },
  })

  useEffect(() => {
    reset({
      sequenceNumber: operation?.sequenceNumber ?? nextSequence,
      code: operation?.code ?? '',
      name: operation?.name ?? '',
      instructions: operation?.instructions ?? '',
      estimatedMinutes: operation?.estimatedMinutes ?? 30,
    })
  }, [nextSequence, operation, reset])

  if (!open) return null

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      reset()
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="routing-operation-title"
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            Hoja de ruta
          </p>
          <h2
            id="routing-operation-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            {operation ? 'Editar operación' : 'Agregar operación'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Define qué debe hacerse y cuánto tiempo se estima. La ejecución real
            se registra después.
          </p>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <TextField
            label="Secuencia"
            type="number"
            min="1"
            error={errors.sequenceNumber?.message}
            {...register('sequenceNumber', { valueAsNumber: true })}
          />
          <TextField
            label="Código"
            maxLength={40}
            placeholder="OP-010"
            error={errors.code?.message}
            {...register('code')}
          />
          <div className="sm:col-span-2">
            <TextField
              label="Nombre"
              maxLength={150}
              placeholder="Torneado exterior"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <TextField
            label="Tiempo estimado (min)"
            type="number"
            min="1"
            error={errors.estimatedMinutes?.message}
            {...register('estimatedMinutes', { valueAsNumber: true })}
          />
          <div className="sm:col-span-2">
            <TextareaField
              label="Instrucciones"
              placeholder="Indicaciones técnicas para ejecutar la operación…"
              error={errors.instructions?.message}
              {...register('instructions')}
            />
          </div>

          {error ? (
            <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? 'Guardando…'
              : operation
                ? 'Guardar cambios'
                : 'Agregar operación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
