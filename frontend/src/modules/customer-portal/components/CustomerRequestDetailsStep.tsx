import type { ReactNode } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Card } from '@/shared/components/ui/Card'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import type { CustomerRequestFormValues } from '../schemas/customerRequest.schemas'

interface CustomerRequestDetailsStepProps {
  register: UseFormRegister<CustomerRequestFormValues>
  errors: FieldErrors<CustomerRequestFormValues>
  actions: ReactNode
}

export function CustomerRequestDetailsStep({
  register,
  errors,
  actions,
}: CustomerRequestDetailsStepProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
      <Card className="p-3.5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)] lg:[&_label]:mb-1 lg:[&_label]:text-xs lg:[&_input]:h-9 lg:[&_input]:text-xs lg:[&_textarea]:min-h-20 lg:[&_textarea]:text-xs lg:[&_textarea]:py-2">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Detalles del trabajo
          </h2>
          <p className="mt-1 text-[10px] leading-5 text-slate-500">
            Usa un nombre reconocible para que tu equipo encuentre la solicitud
            después.
          </p>
        </div>

        <div className="mt-3 space-y-3">
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
              hint="Fecha objetivo; se confirma en la cotización."
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
        </div>
      </Card>

      <div className="space-y-3">
        <Card className="overflow-hidden shadow-[0_12px_35px_-26px_rgba(15,23,42,0.22)]">
          <div className="px-3.5 pt-3.5">
            <h2 className="text-sm font-semibold text-slate-950">
              Qué pasa después
            </h2>
          </div>

          <ol className="px-3.5 pb-2.5 pt-1.5">
            {[
              'El equipo revisa el alcance y la documentación.',
              'Puede pedirte información técnica adicional.',
              'Cuando esté listo, recibirás una cotización.',
            ].map((item, index) => (
              <li
                key={item}
                className="flex gap-3 border-b border-slate-100 py-2.5 last:border-b-0"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-600">
                  {index + 1}
                </span>
                <p className="text-[10px] leading-5 text-slate-600">{item}</p>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/75 p-3.5 shadow-none">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-700">
            No te preocupes por el proceso
          </p>
          <h3 className="mt-2 text-sm font-semibold text-slate-950">
            Describe el resultado que necesitas.
          </h3>
          <p className="mt-2 text-[9px] leading-4 text-slate-600">
            Torno, fresado, tratamientos y demás decisiones internas se definen
            durante la revisión. Si no conoces el material, también podemos
            ayudarte a elegirlo.
          </p>
        </Card>

        {actions}
      </div>
    </div>
  )
}
