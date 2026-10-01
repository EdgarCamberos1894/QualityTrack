import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { TextField } from '@/shared/components/ui/TextField'
import type { CustomerCompanyFormValues } from '../schemas/customerCompany.schemas'

interface CustomerCompanyFieldsProps {
  register: UseFormRegister<CustomerCompanyFormValues>
  errors: FieldErrors<CustomerCompanyFormValues>
  disabled?: boolean
}

export function CustomerCompanyFields({
  register,
  errors,
  disabled = false,
}: CustomerCompanyFieldsProps) {
  return (
    <div className="space-y-5">
      <section>
        <div className="mb-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Identidad
          </p>
          <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
            Datos con los que tu empresa se identifica dentro del portal.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(180px,0.7fr)]">
          <TextField
            label="Nombre de la empresa"
            placeholder="Ej. Maquinados del Pacífico"
            maxLength={200}
            disabled={disabled}
            error={errors.name?.message}
            className="h-10 text-[11px]"
            {...register('name')}
          />
          <TextField
            label="RFC"
            placeholder="Opcional"
            maxLength={50}
            disabled={disabled}
            error={errors.rfc?.message}
            className="h-10 text-[11px]"
            {...register('rfc')}
          />
        </div>
      </section>

      <section className="border-t border-slate-100 pt-5">
        <div className="mb-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Contacto administrativo
          </p>
          <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
            Canales generales de contacto de la empresa.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Correo administrativo"
            type="email"
            placeholder="administracion@empresa.com"
            maxLength={254}
            disabled={disabled}
            error={errors.administrativeEmail?.message}
            className="h-10 text-[11px]"
            {...register('administrativeEmail')}
          />
          <TextField
            label="Teléfono"
            placeholder="Opcional"
            maxLength={30}
            disabled={disabled}
            error={errors.phone?.message}
            className="h-10 text-[11px]"
            {...register('phone')}
          />
        </div>
      </section>

      <section className="border-t border-slate-100 pt-5">
        <div className="mb-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Ubicación y presencia
          </p>
          <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
            Información complementaria para identificar y localizar a la empresa.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Ciudad"
            placeholder="Opcional"
            maxLength={120}
            disabled={disabled}
            error={errors.city?.message}
            className="h-10 text-[11px]"
            {...register('city')}
          />
          <TextField
            label="Estado"
            placeholder="Opcional"
            maxLength={120}
            disabled={disabled}
            error={errors.state?.message}
            className="h-10 text-[11px]"
            {...register('state')}
          />
          <div className="sm:col-span-2">
            <TextField
              label="Sitio web"
              placeholder="https://empresa.com"
              maxLength={255}
              disabled={disabled}
              error={errors.website?.message}
              className="h-10 text-[11px]"
              {...register('website')}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
