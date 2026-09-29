import { formatQuotationDate } from '../model/quotationPresenter'
import type { CustomerQuotationSourceDto } from '../types/customerQuotation.types'

interface CustomerQuotationSourceCardProps {
  source: CustomerQuotationSourceDto
  caseNumber: string
  requestNumber: string
}

function Item({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[9px] font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-[11px] font-semibold text-slate-950">{value}</dd>
    </div>
  )
}

export function CustomerQuotationSourceCard({
  source,
  caseNumber,
  requestNumber,
}: CustomerQuotationSourceCardProps) {
  const technicalMaterial = [source.materialName, source.standardOrGrade]
    .filter(Boolean)
    .join(' / ')
  const material =
    technicalMaterial || source.materialRequirement || 'Sin especificar'

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-600">
        Origen · {caseNumber} / {requestNumber}
      </p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Item label="Trabajo" value={source.title} />
        <Item label="Cantidad" value={`${source.quantity} piezas`} />
        <Item label="Material" value={material} />
        <Item
          label="Fecha solicitada"
          value={formatQuotationDate(source.requestedDeliveryDate)}
        />
      </dl>
    </section>
  )
}
