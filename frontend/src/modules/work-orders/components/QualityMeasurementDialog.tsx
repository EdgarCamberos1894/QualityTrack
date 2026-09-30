import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  qualityMeasurementSchema,
  type QualityMeasurementFormValues,
} from '../schemas/quality.schemas'
import type { QualityMeasurementDto } from '../types/quality.types'

interface QualityMeasurementDialogProps {
  open: boolean
  measurement: QualityMeasurementDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: QualityMeasurementFormValues) => Promise<boolean>
}

const emptyValues: QualityMeasurementFormValues = {
  characteristic: '',
  nominalValue: 0,
  lowerLimit: 0,
  upperLimit: 0,
  measuredValue: 0,
  unit: '',
  notes: '',
}

export function QualityMeasurementDialog({
  open,
  measurement,
  submitting,
  error,
  onClose,
  onSubmit,
}: QualityMeasurementDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QualityMeasurementFormValues>({
    resolver: zodResolver(qualityMeasurementSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return

    reset(
      measurement
        ? {
            characteristic: measurement.characteristic,
            nominalValue: measurement.nominalValue,
            lowerLimit: measurement.lowerLimit,
            upperLimit: measurement.upperLimit,
            measuredValue: measurement.measuredValue,
            unit: measurement.unit,
            notes: measurement.notes ?? '',
          }
        : emptyValues,
    )
  }, [measurement, open, reset])

  if (!open) return null

  const close = () => {
    reset(emptyValues)
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) reset(emptyValues)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="quality-measurement-title"
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
            Medición de Calidad
          </p>
          <h2
            id="quality-measurement-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            {measurement ? 'Editar medición' : 'Registrar medición'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            El resultado PASS o FAIL lo calcula el backend a partir del rango y
            del valor medido.
          </p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <TextField
            label="Característica"
            maxLength={200}
            placeholder="Ej. Diámetro exterior"
            error={errors.characteristic?.message}
            {...register('characteristic')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Valor nominal"
              type="number"
              step="any"
              error={errors.nominalValue?.message}
              {...register('nominalValue', { valueAsNumber: true })}
            />
            <TextField
              label="Unidad"
              maxLength={20}
              placeholder="mm, µm, °C…"
              error={errors.unit?.message}
              {...register('unit')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Límite inferior"
              type="number"
              step="any"
              error={errors.lowerLimit?.message}
              {...register('lowerLimit', { valueAsNumber: true })}
            />
            <TextField
              label="Valor medido"
              type="number"
              step="any"
              error={errors.measuredValue?.message}
              {...register('measuredValue', { valueAsNumber: true })}
            />
            <TextField
              label="Límite superior"
              type="number"
              step="any"
              error={errors.upperLimit?.message}
              {...register('upperLimit', { valueAsNumber: true })}
            />
          </div>

          <TextareaField
            label="Notas"
            maxLength={2000}
            placeholder="Instrumento, condición, observaciones o evidencia relevante…"
            error={errors.notes?.message}
            {...register('notes')}
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
            {submitting
              ? 'Guardando…'
              : measurement
                ? 'Guardar cambios'
                : 'Registrar medición'}
          </Button>
        </div>
      </form>
    </div>
  )
}
