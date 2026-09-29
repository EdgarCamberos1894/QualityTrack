import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import {
  materialSpecificationSchema,
  type MaterialSpecificationFormValues,
} from '../schemas/jobCase.schemas'
import type { CaseMaterialSpecificationDto } from '../types/jobCase.types'

interface MaterialSpecificationFormProps {
  current: CaseMaterialSpecificationDto | null
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: MaterialSpecificationFormValues) => Promise<void>
}

export function MaterialSpecificationForm({
  current,
  isSubmitting,
  onCancel,
  onSubmit,
}: MaterialSpecificationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaterialSpecificationFormValues>({
    resolver: zodResolver(materialSpecificationSchema),
    defaultValues: {
      materialName: current?.materialName ?? '',
      standardOrGrade: current?.standardOrGrade ?? '',
      technicalNotes: current?.technicalNotes ?? '',
    },
  })

  return (
    <form
      className="rounded-xl border border-amber-200 bg-white p-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-sm font-semibold text-slate-950">
        Especificación técnica del material
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <TextField
          label="Material"
          error={errors.materialName?.message}
          {...register('materialName')}
        />
        <TextField
          label="Norma o grado"
          error={errors.standardOrGrade?.message}
          {...register('standardOrGrade')}
        />
      </div>

      <div className="mt-4">
        <TextareaField
          label="Notas técnicas"
          error={errors.technicalNotes?.message}
          {...register('technicalNotes')}
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button size="sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar especificación'}
        </Button>
      </div>
    </form>
  )
}
