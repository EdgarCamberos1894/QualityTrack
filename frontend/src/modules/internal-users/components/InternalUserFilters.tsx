import type { SystemRole } from '@/modules/auth'
import {
  getInternalRoleLabel,
  internalRoles,
} from '../model/internalUserPresenter'
import type {
  InternalUserFiltersValue,
  InternalUserStatus,
} from '../types/internalUser.types'

interface InternalUserFiltersProps {
  value: InternalUserFiltersValue
  onChange: (value: InternalUserFiltersValue) => void
}

const statuses: Array<{ value: InternalUserStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Todos los estados' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'PENDING_ACTIVATION', label: 'Invitación pendiente' },
  { value: 'SUSPENDED', label: 'Suspendidos' },
]

export function InternalUserFilters({
  value,
  onChange,
}: InternalUserFiltersProps) {
  const update = <K extends keyof InternalUserFiltersValue>(
    key: K,
    nextValue: InternalUserFiltersValue[K],
  ) => onChange({ ...value, [key]: nextValue })

  return (
    <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[minmax(280px,1fr)_210px_210px]">
      <label>
        <span className="sr-only">Buscar usuarios internos</span>
        <input
          type="search"
          value={value.search}
          onChange={(event) => update('search', event.target.value)}
          placeholder="Buscar nombre, correo o rol"
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label>
        <span className="sr-only">Filtrar por rol</span>
        <select
          value={value.role}
          onChange={(event) =>
            update('role', event.target.value as SystemRole | 'ALL')
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos los roles</option>
          {internalRoles.map((role) => (
            <option key={role} value={role}>
              {getInternalRoleLabel(role)}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Filtrar por estado</span>
        <select
          value={value.status}
          onChange={(event) =>
            update(
              'status',
              event.target.value as InternalUserStatus | 'ALL',
            )
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
