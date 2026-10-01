import { useLocation } from 'react-router-dom'
import type { AuthenticatedUser } from '@/modules/auth'
import { TopbarActionIcon } from '@/shared/components/navigation/TopbarActionIcon'
import { TopbarBreadcrumb } from '@/shared/components/navigation/TopbarBreadcrumb'
import type { CustomerContextDto } from '../types/customerPortal.types'

interface CustomerPortalTopbarProps {
  customer: CustomerContextDto
  user: AuthenticatedUser
  onOpenMenu: () => void
  onLogout: () => void
}

const roleLabels = {
  ADMIN: 'Administrador',
  REQUESTER: 'Solicitante',
  VIEWER: 'Consulta',
} as const

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
    <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-slate-200/90 bg-white/95 px-5 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur sm:px-7">
      <button
        type="button"
        className="mr-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
        onClick={onOpenMenu}
        aria-label="Abrir navegación"
      >
        <TopbarActionIcon name="menu" />
      </button>

      <div className="hidden min-w-0 max-w-[360px] sm:block">
        <TopbarBreadcrumb value={breadcrumb(location.pathname)} />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        <span className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-[10px] font-semibold text-blue-700 md:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {roleLabels[customer.role]}
        </span>

        <div className="hidden h-8 w-px bg-slate-200 md:block" />

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[11px] font-bold text-blue-700 ring-1 ring-inset ring-blue-100">
          {initials(user.email)}
        </div>

        <div className="hidden min-w-0 max-w-[210px] md:block">
          <p className="truncate text-[11px] font-semibold text-slate-900">
            {user.email}
          </p>
          <p className="mt-0.5 truncate text-[9px] font-medium text-slate-400">
            Cuenta cliente
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="ml-1 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          aria-label="Cerrar sesión"
        >
          <TopbarActionIcon name="logout" className="h-4 w-4" />
          <span className="hidden lg:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
