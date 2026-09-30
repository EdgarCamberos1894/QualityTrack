import { TextField } from '@/shared/components/ui/TextField'
import type { DocumentContextFilter } from '../model/documentCenterPresenter'
import { getDocumentContextLabel } from '../model/documentCenterPresenter'
import type { DocumentContext } from '../types/documentCenter.types'

interface DocumentCenterFiltersProps {
  search: string
  type: string
  context: DocumentContextFilter
  customerId: string
  documentTypes: string[]
  customers: Array<{ id: number; name: string }>
  onSearchChange: (value: string) => void
  onTypeChange: (value: string) => void
  onContextChange: (value: DocumentContextFilter) => void
  onCustomerChange: (value: string) => void
}

const contexts: DocumentContext[] = [
  'CASE',
  'WORK_ORDER',
  'MATERIAL',
  'DELIVERY',
]

const selectClass =
  'h-11 rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

export function DocumentCenterFilters({
  search,
  type,
  context,
  customerId,
  documentTypes,
  customers,
  onSearchChange,
  onTypeChange,
  onContextChange,
  onCustomerChange,
}: DocumentCenterFiltersProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-[minmax(280px,1.6fr)_minmax(160px,0.8fr)_minmax(160px,0.8fr)_minmax(180px,1fr)_auto] xl:items-end">
        <TextField
          label="Buscar"
          value={search}
          placeholder="Nombre, OT, cliente, REQ, CASE…"
          onChange={(event) => onSearchChange(event.target.value)}
        />

        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Tipo
          <select
            value={type}
            className={selectClass}
            onChange={(event) => onTypeChange(event.target.value)}
          >
            <option value="ALL">Todos</option>
            {documentTypes.map((documentType) => (
              <option key={documentType} value={documentType}>
                {documentType}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Contexto
          <select
            value={context}
            className={selectClass}
            onChange={(event) =>
              onContextChange(event.target.value as DocumentContextFilter)
            }
          >
            <option value="ALL">Todos</option>
            {contexts.map((item) => (
              <option key={item} value={item}>
                {getDocumentContextLabel(item)}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-800">
          Cliente
          <select
            value={customerId}
            className={selectClass}
            onChange={(event) => onCustomerChange(event.target.value)}
          >
            <option value="ALL">Todos</option>
            {customers.map((customer) => (
              <option key={customer.id} value={String(customer.id)}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>

        <span className="inline-flex h-11 items-center justify-center rounded-full bg-slate-100 px-4 text-[10px] font-semibold text-slate-600">
          Versión vigente
        </span>
      </div>

      <p className="mt-3 text-[10px] text-slate-500">
        La búsqueda también considera archivo vigente, uploader y referencias
        operativas.
      </p>
    </section>
  )
}
