import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Card } from '@/shared/components/ui/Card'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import type { CustomerRequestFormValues } from '../schemas/customerRequest.schemas'

interface CustomerRequestDetailsStepProps {
  register: UseFormRegister<CustomerRequestFormValues>
  errors: FieldErrors<CustomerRequestFormValues>
}

export function CustomerRequestDetailsStep({
  register,
  errors,
}: CustomerRequestDetailsStepProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,730px)_360px]">
      <Card className="space-y-5 p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Detalles del trabajo
          </h2>
          <p className="mt-1 text-[10px] text-slate-500">
            Usa un nombre reconocible para que tu equipo encuentre la solicitud
            después.
          </p>
        </div>

        <TextField
          label="Nombre del trabajo"
          maxLength={200}
          error={errors.title?.message}
          {...register('title')}
        />
        <TextareaField
          label="Descripción"
          maxLength={5000}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <TextField
            label="Cantidad"
            type="number"
            min={1}
            error={errors.quantity?.message}
            {...register('quantity', { valueAsNumber: true })}
          />
          <TextField
            label="Fecha requerida"
            type="date"
            error={errors.requestedDeliveryDate?.message}
            {...register('requestedDeliveryDate')}
          />
          <TextField
            label="Referencia cliente"
            maxLength={120}
            error={errors.customerReference?.message}
            {...register('customerReference')}
          />
        </div>

        <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 text-[10px] leading-5 text-slate-700">
          La fecha requerida expresa tu objetivo. La fecha comprometida se
          confirma más adelante en la cotización.
        </p>
      </Card>

      <Card className="h-fit p-5">
        <h2 className="text-sm font-semibold text-slate-950">
          Qué pasa después
        </h2>
        <ol className="mt-4 space-y-4 text-[11px] leading-5 text-slate-600">
          <li>1. El equipo revisa el alcance y la documentación.</li>
          <li>2. Puede pedirte información técnica adicional.</li>
          <li>3. Cuando esté listo, recibirás una cotización.</li>
        </ol>
      </Card>
    </div>
  )
}
