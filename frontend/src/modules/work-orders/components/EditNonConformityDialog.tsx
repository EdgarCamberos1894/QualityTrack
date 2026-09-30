import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  nonConformityDetailsSchema,
  type NonConformityDetailsFormValues,
} from '../schemas/nonConformity.schemas'
import type { NonConformityDto } from '../types/quality.types'

interface EditNonConformityDialogProps {
  open: boolean
  nonConformity: NonConformityDto
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: NonConformityDetailsFormValues) => Promise<boolean>
}

export function EditNonConformityDialog({
  open,
  nonConformity,
  submitting,
  error,
  onClose,
  onSubmit,
}: EditNonConformityDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NonConformityDetailsFormValues>({
    resolver: zodResolver(nonConformityDetailsSchema),
    defaultValues: {
      affectedQuantity: nonConformity.affectedQuantity ?? 1,
      severity: nonConformity.severity ?? '',
      description: nonConformity.description ?? '',
    },
  })

  useEffect(() => {
    if (!open) return

    reset({
      affectedQuantity: nonConformity.affectedQuantity ?? 1,
      severity: nonConformity.severity ?? '',
      description: nonConformity.description ?? '',
    })
  }, [nonConformity, open, reset])

  if (!open) return null

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) onClose()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-nc-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-red-700">
            {nonConformity.number}
          </p>
          <h2
            id="edit-nc-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Datos de la no conformidad
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Estos datos quedan bloqueados en cuanto se define una disposición.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Cantidad afectada"
              type="number"
              min="1"
              error={errors.affectedQuantity?.message}
              {...register('affectedQuantity', { valueAsNumber: true })}
            />
            <TextField
              label="Severidad"
              maxLength={50}
              placeholder="Ej. MAJOR"
              error={errors.severity?.message}
              {...register('severity')}
            />
          </div>

          <TextareaField
            label="Descripción"
            maxLength={4000}
            placeholder="Describe la desviación, criterio incumplido y evidencia relevante…"
            error={errors.description?.message}
            {...register('description')}
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar datos'}
          </Button>
        </div>
      </form>
    </div>
  )
}
