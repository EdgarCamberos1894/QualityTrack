import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import type { CustomerContextDto } from '../types/customerPortal.types'

interface CustomerPortalSidebarProps {
  customer: CustomerContextDto
  hasMultipleCustomers: boolean
  open: boolean
  onNavigate: () => void
}

const roleLabels = {
  ADMIN: 'Administrador',
  REQUESTER: 'Solicitante',
  VIEWER: 'Consulta',
} as const

export function CustomerPortalSidebar({
  customer,
  hasMultipleCustomers,
  open,
  onNavigate,
}: CustomerPortalSidebarProps) {
  const base = `/portal/${customer.customerId}`
  const items = [
    { label: 'Inicio', href: base, end: true },
    { label: 'Solicitudes', href: `${base}/requests` },
    { label: 'Cotizaciones', href: `${base}/quotations` },
    { label: 'Miembros', href: `${base}/members` },
    { label: 'Empresa', href: `${base}/company` },
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col overflow-y-auto bg-slate-950 px-6 py-6 text-slate-200 transition-transform shell:static shell:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex items-center gap-3">
        <img
          src="/brand/qualitytrack-mark-inverse.svg"
          alt=""
          className="h-[42px] w-[42px]"
        />
        <span className="text-base font-semibold text-white">
          Quality<span className="text-blue-500">Track</span>
        </span>
      </div>

      <div className="mt-7 flex items-center gap-3 rounded-xl bg-slate-800 px-3.5 py-4">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-teal-700 text-[11px] font-bold text-white">
          QT
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white">
            {customer.customerName}
          </p>
          <p className="mt-1 text-[10px] text-teal-200">Portal de cliente</p>
          <p className="mt-1 text-[9px] text-slate-400">
            {roleLabels[customer.role]}
          </p>
          {hasMultipleCustomers ? (
            <Link
              to="/portal"
              onClick={onNavigate}
              className="mt-2 inline-flex text-[10px] font-semibold text-blue-300 hover:text-white"
            >
              Cambiar empresa
            </Link>
          ) : null}
        </div>
      </div>

      <nav className="mt-8" aria-label="Navegación del portal de cliente">
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <NavLink
                  to={item.href}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex h-10 items-center gap-3 rounded-[10px] px-3.5 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-[#234670] text-white'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'h-2.5 w-2.5 rounded-full border',
                          isActive
                            ? 'border-blue-300 bg-blue-300'
                            : 'border-slate-600',
                        )}
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ) : (
                <span className="flex h-10 items-center gap-3 rounded-[10px] px-3.5 text-xs text-slate-500">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full border border-slate-700"
                  />
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
