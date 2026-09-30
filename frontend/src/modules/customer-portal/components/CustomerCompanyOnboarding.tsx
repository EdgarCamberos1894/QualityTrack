import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useCreateCustomerCompany } from '../hooks/useCreateCustomerCompany'
import {
  customerCompanySchema,
  type CustomerCompanyFormValues,
} from '../schemas/customerCompany.schemas'
import { CustomerCompanyFields } from './CustomerCompanyFields'

interface CustomerCompanyOnboardingProps {
  onCreated: (customerId: number) => void
  onLogout: () => void
}

const defaultValues: CustomerCompanyFormValues = {
  name: '',
  rfc: '',
  phone: '',
  administrativeEmail: '',
  city: '',
  state: '',
  website: '',
}

const steps = [
  {
    number: '01',
    title: 'Registra la empresa',
    description: 'Define el contexto donde vivirán solicitudes y cotizaciones.',
  },
  {
    number: '02',
    title: 'Obtienes acceso administrador',
    description: 'Tu cuenta queda como primer ADMIN de esta empresa.',
  },
  {
    number: '03',
    title: 'Invita a tu equipo',
    description: 'Después podrás agregar miembros con sus propios permisos.',
  },
]

export function CustomerCompanyOnboarding({
  onCreated,
  onLogout,
}: CustomerCompanyOnboardingProps) {
  const mutation = useCreateCustomerCompany()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerCompanyFormValues>({
    resolver: zodResolver(customerCompanySchema),
    defaultValues,
  })

  const submit = handleSubmit(async (values) => {
    try {
      const customer = await mutation.mutateAsync({
        name: values.name.trim(),
        rfc: values.rfc.trim(),
        phone: values.phone.trim(),
        administrativeEmail: values.administrativeEmail.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        website: values.website.trim(),
      })

      onCreated(customer.id)
    } catch {
      // Mutation error is rendered below.
    }
  })

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/brand/qualitytrack-mark.svg"
              alt=""
              className="h-11 w-11"
            />
            <span className="text-lg font-bold tracking-tight text-slate-950">
              Quality<span className="text-blue-600">Track</span>
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            disabled={mutation.isPending}
            onClick={onLogout}
          >
            Cerrar sesión
          </Button>
        </header>

        <div className="grid gap-6 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:items-start lg:gap-12 lg:py-16">
          <section className="pt-2 lg:pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Primer paso
            </p>
            <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Configura el espacio de tu empresa
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
              QualityTrack separa tu cuenta personal del contexto de la empresa.
              Crea la empresa una sola vez y, a partir de ahí, accederás
              directamente a sus solicitudes, cotizaciones y seguimiento.
            </p>

            <div className="mt-8 space-y-3">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="flex gap-4 rounded-xl border border-slate-200 bg-white/70 p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
                    {step.number}
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-950">
                      {step.title}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                ¿Llegaste por invitación?
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Si otra empresa te invitó, utiliza el enlace recibido por correo
                para activar esa membresía. No necesitas crear una empresa
                duplicada.
              </p>
            </div>
          </section>

          <form onSubmit={(event) => void submit(event)}>
            <Card className="overflow-hidden rounded-2xl">
              <div className="border-b border-slate-200 px-6 py-5 sm:px-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Datos de empresa
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  Crea tu empresa
                </h2>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  El nombre es obligatorio. Los datos administrativos restantes
                  pueden completarse ahora o actualizarse después.
                </p>
              </div>

              <div className="px-6 py-6 sm:px-7">
                <CustomerCompanyFields
                  register={register}
                  errors={errors}
                  disabled={mutation.isPending}
                />

                {mutation.error ? (
                  <p
                    role="alert"
                    className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
                  >
                    {getErrorMessage(mutation.error)}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] leading-5 text-slate-500">
                    Al crearla, tu cuenta quedará como administrador inicial.
                  </p>
                  <Button
                    type="submit"
                    className="sm:min-w-48"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending
                      ? 'Creando empresa…'
                      : 'Crear empresa y continuar'}
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </main>
  )
}
