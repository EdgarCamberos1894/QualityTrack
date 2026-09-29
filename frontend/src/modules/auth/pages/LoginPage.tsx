import { useLocation, useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { AuthBrandPanel } from '../components/AuthBrandPanel'

interface LoginLocationState {
  from?: {
    pathname?: string
    search?: string
  }
}

function getDestination(state: unknown): string {
  const candidate = state as LoginLocationState | null
  const pathname = candidate?.from?.pathname

  if (!pathname || !pathname.startsWith('/') || pathname.startsWith('//')) {
    return '/'
  }

  return `${pathname}${candidate?.from?.search ?? ''}`
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const destination = getDestination(location.state)

  return (
    <main className="min-h-screen bg-[#f5f7fb] lg:grid lg:grid-cols-[minmax(380px,0.9fr)_minmax(520px,1.1fr)]">
      <AuthBrandPanel />

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img
              src="/brand/qualitytrack-mark.svg"
              alt=""
              className="h-11 w-11"
            />
            <span className="text-xl font-bold tracking-tight text-slate-950">
              Quality<span className="text-blue-600">Track</span>
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Acceso seguro
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Inicia sesión
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Usa las credenciales asociadas a tu cuenta de QualityTrack.
              </p>
            </div>

            <LoginForm
              onAuthenticated={() => navigate(destination, { replace: true })}
            />
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            El acceso es común para clientes y usuarios internos.
          </p>
        </div>
      </section>
    </main>
  )
}
