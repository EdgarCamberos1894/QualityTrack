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
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
      <Card className="p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)]">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Detalles del trabajo
          </h2>
          <p className="mt-1 text-[10px] leading-5 text-slate-500">
            Usa un nombre reconocible para que tu equipo encuentre la solicitud
            después.
          </p>
        </div>

        <div className="mt-4 space-y-3.5">
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

          <div className="grid gap-3 md:grid-cols-3">
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

          <div className="rounded-xl border border-blue-200 bg-blue-50/65 px-3.5 py-3">
            <p className="text-[10px] leading-5 text-slate-700">
              La fecha requerida expresa tu objetivo. La fecha comprometida se
              confirma más adelante en la cotización.
            </p>
          </div>
        </div>
      </Card>

      <Card className="h-fit overflow-hidden shadow-[0_12px_35px_-26px_rgba(15,23,42,0.22)]">
        <div className="px-4 pt-4">
          <h2 className="text-sm font-semibold text-slate-950">
            Qué pasa después
          </h2>
        </div>

        <ol className="px-4 pb-3 pt-2">
          {[
            'El equipo revisa el alcance y la documentación.',
            'Puede pedirte información técnica adicional.',
            'Cuando esté listo, recibirás una cotización.',
          ].map((item, index) => (
            <li
              key={item}
              className="flex gap-3 border-b border-slate-100 py-3 last:border-b-0"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-600">
                {index + 1}
              </span>
              <p className="text-[10px] leading-5 text-slate-600">{item}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  )
}
