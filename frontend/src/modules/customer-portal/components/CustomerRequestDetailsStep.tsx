import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,730px)_360px]">
      <Card className="relative overflow-hidden p-5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.32)]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400" />

        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <SidebarNavIcon name="requests" className="h-[17px] w-[17px]" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Información principal
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
              Detalles del trabajo
            </h2>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              Usa un nombre reconocible para que tu equipo encuentre la
              solicitud después.
            </p>
          </div>
        </div>

        <div className="space-y-4">
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

          <div className="flex gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
              i
            </span>
            <p className="text-[10px] leading-5 text-slate-700">
              La fecha requerida expresa tu objetivo. La fecha comprometida se
              confirma más adelante en la cotización.
            </p>
          </div>
        </div>
      </Card>

      <Card className="h-fit overflow-hidden border-slate-200 bg-slate-50/75 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.24)]">
        <div className="border-b border-slate-200 bg-white px-4 py-3.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Después de enviar
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
            Qué pasa después
          </h2>
        </div>

        <ol className="space-y-0 px-4 py-2">
          {[
            'El equipo revisa el alcance y la documentación.',
            'Puede pedirte información técnica adicional.',
            'Cuando esté listo, recibirás una cotización.',
          ].map((item, index) => (
            <li
              key={item}
              className="flex gap-3 border-b border-slate-200/70 py-3 last:border-b-0"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[9px] font-bold text-blue-600">
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
