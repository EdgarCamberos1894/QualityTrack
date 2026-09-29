import { useQueryClient } from '@tanstack/react-query'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { clearCurrentSession } from '@/modules/auth'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Button } from '@/shared/components/ui/Button'
import { useCustomerContexts } from '../hooks/useCustomerContexts'

export function CustomerPortalLandingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const query = useCustomerContexts()

  const logout = () => {
    clearCurrentSession()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  if (query.isPending) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] p-8">
        <LoadingState label="Cargando tus empresas…" />
      </main>
    )
  }

  if (query.isError) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] p-8">
        <ErrorState
          error={query.error}
          title="No pudimos cargar tus empresas"
        />
      </main>
    )
  }

  const [firstCustomer] = query.data

  if (!firstCustomer) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] p-8">
        <div className="w-full max-w-lg space-y-4">
          <EmptyState
            title="Sin empresas activas"
            description="Tu cuenta no tiene una membresía activa en ninguna empresa cliente."
          />
          <div className="flex justify-center">
            <Button variant="secondary" onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (query.data.length === 1) {
    return <Navigate to={`/portal/${firstCustomer.customerId}`} replace />
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/brand/qualitytrack-mark.svg"
              alt=""
              className="h-11 w-11"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-950">
                Selecciona una empresa
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Tu cuenta tiene acceso a más de un contexto de cliente.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {query.data.map((customer) => (
            <Link
              key={customer.customerId}
              to={`/portal/${customer.customerId}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-slate-950">
                {customer.customerName}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Rol: {customer.role}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
