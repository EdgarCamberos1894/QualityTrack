import type { InternalCustomerFiltersValue } from '../types/internalCustomer.types'

interface InternalCustomerFiltersProps {
  value: InternalCustomerFiltersValue
  onChange: (value: InternalCustomerFiltersValue) => void
}

export function InternalCustomerFilters({
  value,
  onChange,
}: InternalCustomerFiltersProps) {
  return (
    <div className="grid gap-3 border-y border-slate-200 bg-slate-50/70 px-4 py-3 @2xl/page:grid-cols-[minmax(240px,1fr)_220px]">
      <label>
        <span className="sr-only">Buscar clientes</span>
        <input
          type="search"
          value={value.search}
          onChange={(event) =>
            onChange({ ...value, search: event.target.value })
          }
          placeholder="Buscar por empresa, RFC, correo o ubicación…"
          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label>
        <span className="sr-only">Filtrar por estado</span>
        <select
          value={value.status}
          onChange={(event) =>
            onChange({
              ...value,
              status: event.target.value as InternalCustomerFiltersValue['status'],
            })
          }
          className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos los estados</option>
          <option value="ACTIVE">Activas</option>
          <option value="SUSPENDED">Suspendidas</option>
        </select>
      </label>
    </div>
  )
}
