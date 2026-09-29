import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import {
  informationRequestSchema,
  type InformationRequestFormValues,
} from '../schemas/jobCase.schemas'

interface InformationRequestFormProps {
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: InformationRequestFormValues) => Promise<void>
}

export function InformationRequestForm({
  isSubmitting,
  onCancel,
  onSubmit,
}: InformationRequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InformationRequestFormValues>({
    resolver: zodResolver(informationRequestSchema),
    defaultValues: { question: '' },
  })

  return (
    <form
      className="rounded-xl border border-amber-200 bg-white p-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-sm font-semibold text-slate-950">
        Solicitar aclaración al cliente
      </h2>
      <p className="mt-1 text-[10px] text-slate-500">
        El expediente pasará a esperando información del cliente.
      </p>

      <div className="mt-4">
        <TextareaField
          label="Pregunta"
          placeholder="Describe exactamente qué información necesita el equipo."
          error={errors.question?.message}
          {...register('question')}
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
          {isSubmitting ? 'Enviando…' : 'Solicitar información'}
        </Button>
      </div>
    </form>
  )
}
