import {
  QUOTATION_STATUSES,
  type QuotationFiltersValue,
  type QuotationStatus,
} from '../types/quotation.types'
import { getQuotationStatusPresentation } from '../model/quotationPresenter'

interface QuotationFiltersProps {
  value: QuotationFiltersValue
  onChange: (value: QuotationFiltersValue) => void
}

export function QuotationFilters({ value, onChange }: QuotationFiltersProps) {
  const update = <K extends keyof QuotationFiltersValue>(
    key: K,
    nextValue: QuotationFiltersValue[K],
  ) => onChange({ ...value, [key]: nextValue })

  return (
    <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[minmax(260px,1fr)_220px]">
      <label className="block">
        <span className="sr-only">Buscar cotizaciones</span>
        <input
          type="search"
          value={value.search}
          onChange={(event) => update('search', event.target.value)}
          placeholder="Buscar por cotización, expediente, solicitud o cliente"
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="sr-only">Filtrar por estado</span>
        <select
          value={value.status}
          onChange={(event) =>
            update('status', event.target.value as QuotationStatus | 'ALL')
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos los estados</option>
          {QUOTATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getQuotationStatusPresentation(status).label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
