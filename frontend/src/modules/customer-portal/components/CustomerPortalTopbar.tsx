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
  if (pathname.includes('/quotations/')) {
    return 'Portal / Cotizaciones / Detalle'
  }

  if (pathname.endsWith('/quotations')) {
    return 'Portal / Cotizaciones'
  }

  return 'Portal / Inicio'
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
        <div className="hidden text-right md:block">
          <p className="max-w-[220px] truncate text-[11px] font-semibold text-slate-950">
            {customer.customerName}
          </p>
          <p className="mt-1 max-w-[220px] truncate text-[9px] text-slate-500">
            {user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
