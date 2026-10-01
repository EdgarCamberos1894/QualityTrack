import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { PublicAuthLayout } from '../components/PublicAuthLayout'

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
    <PublicAuthLayout
      eyebrow="Acceso seguro"
      title="Inicia sesión"
      description="Usa las credenciales asociadas a tu cuenta de QualityTrack."
      footer={
        <span>El acceso es común para clientes y usuarios internos.</span>
      }
    >
      <LoginForm
        onAuthenticated={() => navigate(destination, { replace: true })}
      />

      <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-100 pt-4 text-center text-[9px] sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="font-semibold text-blue-600 hover:text-blue-700"
          to="/forgot-password"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        <Link
          className="font-semibold text-blue-600 hover:text-blue-700"
          to="/register"
        >
          Crear cuenta de cliente
        </Link>
      </div>
    </PublicAuthLayout>
  )
}
