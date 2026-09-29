import type { AuthenticatedUser } from '@/modules/auth'

interface TopbarProps {
  user: AuthenticatedUser
  onOpenMenu: () => void
  onLogout: () => void
}

function getShiftLabel(): string {
  const hour = new Date().getHours()

  if (hour < 12) return 'Turno matutino'
  if (hour < 19) return 'Turno vespertino'
  return 'Turno nocturno'
}

function getInitials(email: string): string {
  return email.slice(0, 2).toUpperCase()
}

export function Topbar({ user, onOpenMenu, onLogout }: TopbarProps) {
  const roleLabel =
    user.roles.length > 0 ? user.roles.join(' · ') : user.accountType

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
        Operación / Inicio
      </p>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-teal-700 md:inline-flex">
          {getShiftLabel()}
        </span>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-teal-700">
          {getInitials(user.email)}
        </div>

        <div className="hidden max-w-[220px] sm:block">
          <p className="truncate text-[11px] font-semibold text-slate-950">
            {user.email}
          </p>
          <p className="mt-1 truncate text-[9px] text-slate-500">{roleLabel}</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="ml-1 rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
