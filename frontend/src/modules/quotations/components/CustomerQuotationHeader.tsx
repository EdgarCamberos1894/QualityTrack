import { Badge } from '@/shared/components/ui/Badge'
import { getCustomerQuotationStatusPresentation } from '../model/customerQuotationPresenter'
import type { CustomerQuotationDetailDto } from '../types/customerQuotation.types'

interface CustomerQuotationHeaderProps {
  quotation: CustomerQuotationDetailDto
  customerName: string
}

export function CustomerQuotationHeader({
  quotation,
  customerName,
}: CustomerQuotationHeaderProps) {
  const status = getCustomerQuotationStatusPresentation(
    quotation.customerStatus,
  )
  const includesAdjustmentResponse =
    quotation.customerStatus === 'SENT' &&
    Boolean(quotation.adjustment?.notes) &&
    Boolean(quotation.adjustment?.response)
  const label = includesAdjustmentResponse ? 'Nueva revisión' : status.label
  const description = includesAdjustmentResponse
    ? 'Respuesta al ajuste incluida'
    : status.description

  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[10px] text-slate-500">
          Portal / Cotizaciones / {quotation.quotationNumber}
        </p>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight text-slate-950">
          {quotation.quotationNumber}
        </h1>
        <p className="mt-1 text-[13px] font-medium text-slate-700">
          Revisión {quotation.revision} · {customerName}
        </p>
      </div>

      <div className="sm:max-w-sm sm:text-right">
        <Badge tone={status.tone} className="px-4 py-1.5 text-[10px] uppercase">
          {label}
        </Badge>
        <p className="mt-2 text-[10px] leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}
