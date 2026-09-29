import { Badge } from '@/shared/components/ui/Badge'
import { getQuotationStatusPresentation } from '../model/quotationPresenter'
import type { QuotationDetailDto } from '../types/quotation.types'

interface QuotationDetailHeaderProps {
  quotation: QuotationDetailDto
}

export function QuotationDetailHeader({
  quotation,
}: QuotationDetailHeaderProps) {
  const status = getQuotationStatusPresentation(quotation.status)
  const hasAdjustment =
    quotation.status === 'DRAFT' && Boolean(quotation.adjustmentNotes)

  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[10px] text-slate-500">
          Cotizaciones / {quotation.quotationNumber}
        </p>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight text-slate-950">
          {quotation.quotationNumber}
        </h1>
        <p className="mt-1 text-[13px] font-medium text-slate-700">
          Revisión {quotation.revision} · {quotation.customerName}
        </p>
      </div>

      <div className="sm:text-right">
        <Badge
          tone={hasAdjustment ? 'warning' : status.tone}
          className="px-4 py-1.5 text-[10px]"
        >
          {hasAdjustment ? 'Ajuste pendiente' : status.label}
        </Badge>
        <p className="mt-2 text-[9px] text-slate-500">
          Estado interno · {quotation.status}
        </p>
      </div>
    </div>
  )
}
