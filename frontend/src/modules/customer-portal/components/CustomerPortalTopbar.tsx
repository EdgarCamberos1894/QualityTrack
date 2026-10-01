import { useLocation } from 'react-router-dom'
import type { AuthenticatedUser } from '@/modules/auth'
import type { CustomerContextDto } from '../types/customerPortal.types'

interface CustomerPortalTopbarProps {
  customer: CustomerContextDto
  user: AuthenticatedUser
  onOpenMenu: () => void
  onLogout: () => void
}

function breadcrumb(pathname: string): string {
  if (pathname.endsWith('/members')) {
    return 'Empresa / Miembros'
  }

  if (pathname.endsWith('/company')) {
    return 'Empresa / Datos de empresa'
  }

  if (pathname.includes('/requests/new')) {
    return 'Gestión / Solicitudes / Nueva solicitud'
  }

  if (pathname.includes('/requests/')) {
    return 'Gestión / Solicitudes / Detalle'
  }

  if (pathname.endsWith('/requests')) {
    return 'Gestión / Solicitudes'
  }

  if (pathname.includes('/quotations/')) {
    return 'Gestión / Cotizaciones / Detalle'
  }

  if (pathname.endsWith('/quotations')) {
    return 'Gestión / Cotizaciones'
  }

  return 'Principal / Panel'
}

function initials(email: string): string {
  const localPart = email.split('@')[0] ?? ''
  const normalized = localPart.replace(/[^a-zA-Z0-9]/g, '')

  return normalized.slice(0, 2).toUpperCase() || 'QT'
}

export function CustomerPortalTopbar({
  customer,
  user,
  onOpenMenu,
  onLogout,
}: CustomerPortalTopbarProps) {
  const location = useLocation()

  return (
    <header className="flex h-[76px] items-center border-b border-slate-200 bg-white px-5 sm:px-8">
      <button
        type="button"
        className="mr-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
        onClick={onOpenMenu}
        aria-label="Abrir navegación"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ☰
        </span>
      </button>

      <p className="hidden text-[11px] text-slate-500 sm:block">
        {breadcrumb(location.pathname)}
      </p>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-semibold text-emerald-700 sm:inline-flex">
          Cuenta cliente
        </span>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700">
          {initials(user.email)}
        </div>

        <div className="hidden min-w-0 md:block">
          <p className="max-w-[180px] truncate text-[11px] font-semibold text-slate-950">
            {user.email}
          </p>
          <p className="mt-1 text-[9px] text-slate-500">{customer.role}</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg px-2 py-2 text-[11px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
