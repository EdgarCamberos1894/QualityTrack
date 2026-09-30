import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  createMaterialSchema,
  type CreateMaterialFormValues,
} from '../schemas/resource.schemas'

interface CreateMaterialDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CreateMaterialFormValues) => Promise<boolean>
}

export function CreateMaterialDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: CreateMaterialDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMaterialFormValues>({
    resolver: zodResolver(createMaterialSchema),
    defaultValues: { code: '', name: '', specification: '', unit: '' },
  })

  if (!open) return null

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
        aria-labelledby="create-material-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            Recursos / Materiales
          </p>
          <h2
            id="create-material-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Registrar material
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Crea la referencia base. Las entradas físicas se registran después
            como lotes trazables.
          </p>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <TextField
            label="Código"
            maxLength={50}
            placeholder="AL-6061"
            disabled={submitting}
            error={errors.code?.message}
            {...register('code')}
          />
          <TextField
            label="Unidad"
            maxLength={20}
            placeholder="kg, pza, m"
            disabled={submitting}
            error={errors.unit?.message}
            {...register('unit')}
          />
          <div className="sm:col-span-2">
            <TextField
              label="Nombre"
              maxLength={255}
              placeholder="Aluminio 6061"
              disabled={submitting}
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <div className="sm:col-span-2">
            <TextareaField
              label="Especificación"
              maxLength={500}
              placeholder="Norma, grado, dimensiones u otra referencia técnica…"
              disabled={submitting}
              error={errors.specification?.message}
              {...register('specification')}
            />
          </div>

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
            {submitting ? 'Registrando…' : 'Registrar material'}
          </Button>
        </div>
      </form>
    </div>
  )
}
