import { formatQuotationDate } from '../model/quotationPresenter'
import type { QuotationSourceDto } from '../types/quotation.types'

interface QuotationSourceCardProps {
  source: QuotationSourceDto
}

function SourceItem({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div>
      <dt className="text-[9px] font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-[11px] font-semibold text-slate-950">{value}</dd>
    </div>
  )
}

export function QuotationSourceCard({ source }: QuotationSourceCardProps) {
  const material =
    source.materialSpecification?.materialName ??
    source.materialRequirement ??
    'Sin especificar'
  const standard = source.materialSpecification?.standardOrGrade
  const materialLabel = standard ? `${material} / ${standard}` : material

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-600">
        Origen · {source.caseNumber} / {source.requestNumber}
      </p>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2 @4xl/page:grid-cols-4">
        <SourceItem label="Trabajo" value={source.title} />
        <SourceItem label="Cantidad" value={`${source.quantity} piezas`} />
        <SourceItem label="Material" value={materialLabel} />
        <SourceItem
          label="Fecha solicitada"
          value={formatQuotationDate(source.requestedDeliveryDate)}
        />
      </dl>
    </section>
  )
}
