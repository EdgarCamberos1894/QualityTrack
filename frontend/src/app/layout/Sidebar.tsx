import { Link, useLocation } from 'react-router-dom'
import { navigationItems, type NavigationItem } from '@/app/layout/navigation'
import { cn } from '@/shared/lib/cn'

interface SidebarProps {
  open: boolean
  onNavigate: () => void
}

function isNavigationItemActive(
  item: NavigationItem,
  pathname: string,
  search: string,
): boolean {
  if (!item.href) return false

  const workOrderDetail = pathname.startsWith('/work-orders/')
  const workOrderTab = new URLSearchParams(search).get('tab')

  if (item.workOrderTab) {
    return (
      pathname === item.href ||
      (workOrderDetail && workOrderTab === item.workOrderTab)
    )
  }

  if (item.href === '/work-orders') {
    return (
      pathname === '/work-orders' ||
      (workOrderDetail &&
        workOrderTab !== 'production' &&
        workOrderTab !== 'quality')
    )
  }

  if (item.href === '/') return pathname === '/'

  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const location = useLocation()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col overflow-y-auto bg-slate-950 px-6 py-6 text-slate-200 transition-transform lg:static lg:translate-x-0',
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
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">
            Planta Tepic
          </p>
          <p className="mt-1 truncate text-[10px] text-teal-200">
            Operación interna
          </p>
        </div>
      </div>

      <nav className="mt-8" aria-label="Navegación principal">
        <ul className="space-y-1.5">
          {navigationItems.map((item) => {
            const active = isNavigationItemActive(
              item,
              location.pathname,
              location.search,
            )

            return (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    to={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex h-10 items-center gap-3 rounded-[10px] px-3.5 text-xs font-medium transition-colors',
                      active
                        ? 'bg-[#234670] text-white'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-2.5 w-2.5 rounded-full border',
                        active
                          ? 'border-blue-300 bg-blue-300'
                          : 'border-slate-600',
                      )}
                    />
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex h-10 cursor-default items-center gap-3 rounded-[10px] px-3.5 text-xs text-slate-500"
                  >
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full border border-slate-700"
                    />
                    {item.label}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
