import type {
  DocumentCenterDto,
  DocumentContextDto,
} from '../types/documentCenter.types'

interface DocumentCenterFiltersProps {
  documents: DocumentCenterDto[]
  search: string
  type: string
  context: DocumentContextDto | 'ALL'
  customerId: number | 'ALL'
  onSearchChange: (value: string) => void
  onTypeChange: (value: string) => void
  onContextChange: (value: DocumentContextDto | 'ALL') => void
  onCustomerChange: (value: number | 'ALL') => void
}

const contexts: Array<{
  value: DocumentContextDto | 'ALL'
  label: string
}> = [
  { value: 'ALL', label: 'Etapa: Todas' },
  { value: 'CASE', label: 'Expediente' },
  { value: 'WORK_ORDER', label: 'Orden de trabajo' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'DELIVERY', label: 'Entrega' },
]

export function DocumentCenterFilters({
  documents,
  search,
  type,
  context,
  customerId,
  onSearchChange,
  onTypeChange,
  onContextChange,
  onCustomerChange,
}: DocumentCenterFiltersProps) {
  const documentTypes = [
    ...new Set(documents.map((item) => item.documentType)),
  ].sort((left, right) => left.localeCompare(right))
  const customers = [
    ...new Map(
      documents
        .filter(
          (item) => item.customerId !== null && item.customerName !== null,
        )
        .map((item) => [
          item.customerId as number,
          { id: item.customerId as number, name: item.customerName as string },
        ]),
    ).values(),
  ].sort((left, right) => left.name.localeCompare(right.name))

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_190px_190px_220px]">
        <label>
          <span className="sr-only">Buscar documentos</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar nombre, OT, cliente, lote…"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label>
          <span className="sr-only">Tipo de documento</span>
          <select
            value={type}
            onChange={(event) => onTypeChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="ALL">Tipo: Todos</option>
            {documentTypes.map((documentType) => (
              <option key={documentType} value={documentType}>
                {documentType}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Etapa</span>
          <select
            value={context}
            onChange={(event) =>
              onContextChange(event.target.value as DocumentContextDto | 'ALL')
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
          >
            {contexts.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Cliente</span>
          <select
            value={customerId}
            onChange={(event) =>
              onCustomerChange(
                event.target.value === 'ALL'
                  ? 'ALL'
                  : Number(event.target.value),
              )
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="ALL">Cliente: Todos</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-3 text-[10px] text-slate-500">
        Se muestran siempre las versiones vigentes. El historial permanece
        disponible por documento.
      </p>
    </section>
  )
}
