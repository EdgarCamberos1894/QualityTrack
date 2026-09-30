import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { MaterialDto } from '@/modules/materials'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  createMaterialLotSchema,
  type CreateMaterialLotFormValues,
} from '../schemas/resource.schemas'

interface CreateMaterialLotDialogProps {
  material: MaterialDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CreateMaterialLotFormValues) => Promise<boolean>
}

export function CreateMaterialLotDialog({
  material,
  submitting,
  error,
  onClose,
  onSubmit,
}: CreateMaterialLotDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMaterialLotFormValues>({
    resolver: zodResolver(createMaterialLotSchema),
    defaultValues: {
      lotNumber: '',
      supplier: '',
      receivedAt: '',
      quantityReceived: 1,
    },
  })

  if (!material) return null

  const close = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      reset()
      onClose()
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-material-lot-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            Recursos / Materiales / Lotes
          </p>
          <h2
            id="create-material-lot-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Registrar lote
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {material.code} · {material.name} · unidad {material.unit}
          </p>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <TextField
            label="Número de lote"
            maxLength={100}
            placeholder="L-2026-009"
            disabled={submitting}
            error={errors.lotNumber?.message}
            {...register('lotNumber')}
          />
          <TextField
            label="Proveedor"
            maxLength={255}
            placeholder="Opcional"
            disabled={submitting}
            error={errors.supplier?.message}
            {...register('supplier')}
          />
          <TextField
            label="Cantidad recibida"
            type="number"
            min="0.001"
            step="0.001"
            endAdornment={
              <span className="text-xs font-medium text-slate-500">
                {material.unit}
              </span>
            }
            disabled={submitting}
            error={errors.quantityReceived?.message}
            {...register('quantityReceived', { valueAsNumber: true })}
          />
          <TextField
            label="Fecha de recepción"
            type="datetime-local"
            disabled={submitting}
            error={errors.receivedAt?.message}
            hint="Si se deja vacía, el backend utilizará la hora actual."
            {...register('receivedAt')}
          />

          {error ? (
            <p
              role="alert"
              className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Registrando…' : 'Registrar lote'}
          </Button>
        </div>
      </form>
    </div>
  )
}
