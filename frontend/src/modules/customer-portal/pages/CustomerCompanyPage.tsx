import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useCustomerCompany } from '../hooks/useCustomerCompany'
import { useCustomerCompanyMutations } from '../hooks/useCustomerCompanyMutations'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import {
  customerCompanySchema,
  type CustomerCompanyFormValues,
} from '../schemas/customerCompany.schemas'

export function CustomerCompanyPage() {
  const { customer } = useCustomerPortalContext()
  const query = useCustomerCompany(customer.customerId)
  const mutations = useCustomerCompanyMutations(customer.customerId)
  const isAdmin = customer.role === 'ADMIN'

  const company = query.data
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CustomerCompanyFormValues>({
    resolver: zodResolver(customerCompanySchema),
    values: {
      name: company?.name ?? '',
      rfc: company?.rfc ?? '',
      phone: company?.phone ?? '',
      administrativeEmail: company?.administrativeEmail ?? '',
      city: company?.city ?? '',
      state: company?.state ?? '',
      website: company?.website ?? '',
    },
  })

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando empresa…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState error={query.error} title="No pudimos cargar la empresa" />
      </PageContainer>
    )
  }

  const submit = handleSubmit(async (values) => {
    try {
      await mutations.updateCompany.mutateAsync({
        name: values.name.trim(),
        rfc: values.rfc.trim(),
        phone: values.phone.trim(),
        administrativeEmail: values.administrativeEmail.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        website: values.website.trim(),
      })
    } catch {
      // Mutation error is rendered below.
    }
  })

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Empresa</h1>
        <p className="mt-2 text-sm text-slate-600">
          Información administrativa visible dentro de QualityTrack.
        </p>
      </div>

      <form
        className="grid gap-5 @5xl/page:grid-cols-[minmax(0,720px)_360px]"
        onSubmit={(event) => void submit(event)}
      >
        <Card className="space-y-5 p-5">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Información general
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Solo un administrador puede modificar estos datos.
            </p>
          </div>

          <TextField
            label="Nombre de la empresa"
            maxLength={200}
            disabled={!isAdmin}
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="RFC"
              maxLength={50}
              disabled={!isAdmin}
              error={errors.rfc?.message}
              {...register('rfc')}
            />
            <TextField
              label="Teléfono"
              maxLength={30}
              disabled={!isAdmin}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <TextField
              label="Correo administrativo"
              type="email"
              maxLength={254}
              disabled={!isAdmin}
              error={errors.administrativeEmail?.message}
              {...register('administrativeEmail')}
            />
            <TextField
              label="Sitio web"
              maxLength={255}
              disabled={!isAdmin}
              error={errors.website?.message}
              {...register('website')}
            />
            <TextField
              label="Ciudad"
              maxLength={120}
              disabled={!isAdmin}
              error={errors.city?.message}
              {...register('city')}
            />
            <TextField
              label="Estado"
              maxLength={120}
              disabled={!isAdmin}
              error={errors.state?.message}
              {...register('state')}
            />
          </div>

          {mutations.updateCompany.error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(mutations.updateCompany.error)}
            </p>
          ) : null}

          {mutations.updateCompany.isSuccess ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              Información actualizada correctamente.
            </p>
          ) : null}

          {isAdmin ? (
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!isDirty || mutations.updateCompany.isPending}
              >
                {mutations.updateCompany.isPending
                  ? 'Guardando…'
                  : 'Guardar cambios'}
              </Button>
            </div>
          ) : null}
        </Card>

        <Card className="h-fit p-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            Acceso actual
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {customer.customerName}
          </p>
          <p className="mt-2 text-[10px] leading-5 text-slate-600">
            Tu rol en esta empresa es <strong>{customer.role}</strong>.
          </p>
          <p className="mt-4 text-[10px] leading-5 text-slate-500">
            QualityTrack conserva los cambios administrativos separados del
            flujo operativo de solicitudes, cotizaciones y órdenes.
          </p>
        </Card>
      </form>
    </PageContainer>
  )
}
