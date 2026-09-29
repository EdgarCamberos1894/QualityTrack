import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { getCustomerQuotationStatusPresentation } from '../model/customerQuotationPresenter'
import { formatQuotationDate } from '../model/quotationPresenter'
import type { CustomerQuotationDetailDto } from '../types/customerQuotation.types'

interface CustomerQuotationHeaderProps {
  quotation: CustomerQuotationDetailDto
  customerName: string
  canDecide: boolean
  submitting: boolean
  onRequestAdjustment: () => void
  onReject: () => void
  onApprove: () => void
}

export function CustomerQuotationHeader({
  quotation,
  customerName,
  canDecide,
  submitting,
  onRequestAdjustment,
  onReject,
  onApprove,
}: CustomerQuotationHeaderProps) {
  const status = getCustomerQuotationStatusPresentation(
    quotation.customerStatus,
  )
  const includesAdjustmentResponse =
    quotation.customerStatus === 'SENT' &&
    Boolean(quotation.adjustment?.notes) &&
    Boolean(quotation.adjustment?.response)
  const waitingForAdjustment =
    quotation.customerStatus === 'ADJUSTMENT_REQUESTED'

  const label = includesAdjustmentResponse ? 'Nueva revisión' : status.label
  const description = includesAdjustmentResponse
    ? 'Respuesta al ajuste incluida'
    : waitingForAdjustment
      ? 'Nueva revisión en preparación'
      : quotation.customerStatus === 'SENT'
        ? `Vigente hasta ${formatQuotationDate(quotation.validUntil)}`
        : status.description

  return (
    <header className="mb-4 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <p className="text-[10px] text-slate-500">
          Cotizaciones / {quotation.quotationNumber}
        </p>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight text-slate-950">
          {quotation.quotationNumber}
        </h1>
        <p className="mt-1 text-[14px] font-medium text-slate-700">
          Revisión {quotation.revision} · {customerName}
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="min-w-[150px] pt-1 lg:text-right">
          <Badge
            tone={status.tone}
            className="px-4 py-1.5 text-[10px] uppercase"
          >
            {label}
          </Badge>
          <p className="mt-2 text-[9px] leading-4 text-slate-500">
            {description}
          </p>
        </div>

        {canDecide ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={onRequestAdjustment}
              disabled={submitting}
            >
              Solicitar ajuste
            </Button>
            <Button
              variant="danger"
              onClick={onReject}
              disabled={submitting}
            >
              Rechazar
            </Button>
            <Button onClick={onApprove} disabled={submitting}>
              Aprobar cotización
            </Button>
          </div>
        ) : waitingForAdjustment ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled>
              Ajuste enviado
            </Button>
            <Button variant="secondary" disabled>
              Vista previa
            </Button>
            <Button variant="secondary" disabled>
              Esperando respuesta
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
