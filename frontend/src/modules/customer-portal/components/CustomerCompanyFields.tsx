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
      <TextField
        label="Nombre de la empresa"
        placeholder="Ej. Maquinados del Pacífico"
        maxLength={200}
        disabled={disabled}
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="RFC"
          placeholder="Opcional"
          maxLength={50}
          disabled={disabled}
          error={errors.rfc?.message}
          {...register('rfc')}
        />
        <TextField
          label="Teléfono"
          placeholder="Opcional"
          maxLength={30}
          disabled={disabled}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <TextField
          label="Correo administrativo"
          type="email"
          placeholder="administracion@empresa.com"
          maxLength={254}
          disabled={disabled}
          error={errors.administrativeEmail?.message}
          {...register('administrativeEmail')}
        />
        <TextField
          label="Sitio web"
          placeholder="https://empresa.com"
          maxLength={255}
          disabled={disabled}
          error={errors.website?.message}
          {...register('website')}
        />
        <TextField
          label="Ciudad"
          placeholder="Opcional"
          maxLength={120}
          disabled={disabled}
          error={errors.city?.message}
          {...register('city')}
        />
        <TextField
          label="Estado"
          placeholder="Opcional"
          maxLength={120}
          disabled={disabled}
          error={errors.state?.message}
          {...register('state')}
        />
      </div>
    </div>
  )
}
