import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { getCustomerQuotationStatusPresentation } from '../model/customerQuotationPresenter'
import { formatQuotationDate } from '../model/quotationPresenter'
import type { CustomerQuotationDetailDto } from '../types/customerQuotation.types'

interface CustomerQuotationHeaderProps {
  customerId: number
  quotation: CustomerQuotationDetailDto
  customerName: string
  canDecide: boolean
  submitting: boolean
  onRequestAdjustment: () => void
  onReject: () => void
  onApprove: () => void
}

function statusDescription(
  quotation: CustomerQuotationDetailDto,
  includesAdjustmentResponse: boolean,
): string {
  if (includesAdjustmentResponse) {
    return 'Comercial respondió tu solicitud de ajuste en esta revisión.'
  }

  if (quotation.customerStatus === 'ADJUSTMENT_REQUESTED') {
    return 'Tu solicitud de ajuste fue enviada. Comercial está preparando una nueva revisión.'
  }

  if (quotation.customerStatus === 'SENT') {
    return `Disponible para tu decisión hasta ${formatQuotationDate(quotation.validUntil)}.`
  }

  return getCustomerQuotationStatusPresentation(quotation.customerStatus)
    .description
}

export function CustomerQuotationHeader({
  customerId,
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

  const label = includesAdjustmentResponse ? 'Nueva revisión' : status.label
  const description = statusDescription(quotation, includesAdjustmentResponse)

  return (
    <header className="mb-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
            <SidebarNavIcon name="quotations" className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
              Gestión comercial
            </p>

            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-950 lg:text-[22px]">
                {quotation.quotationNumber}
              </h1>
              <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
                {label}
              </Badge>
            </div>

            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              Revisión {quotation.revision} · {customerName}
            </p>
          </div>
        </div>

        <Link
          to={`/portal/${customerId}/quotations`}
          className="inline-flex h-6 shrink-0 items-center gap-1 rounded-md border border-slate-300 bg-white/85 px-2 text-[7px] font-medium leading-none text-slate-500 transition hover:border-slate-400 hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-3 w-3 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Volver a cotizaciones</span>
        </Link>
      </div>

      <div
        className={
          quotation.customerStatus === 'ADJUSTMENT_REQUESTED' ||
          quotation.customerStatus === 'EXPIRED'
            ? 'mt-3 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between'
            : quotation.customerStatus === 'APPROVED'
              ? 'mt-3 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/55 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between'
              : quotation.customerStatus === 'REJECTED' ||
                  quotation.customerStatus === 'CANCELLED'
                ? 'mt-3 flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50/45 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between'
                : quotation.customerStatus === 'REPLACED'
                  ? 'mt-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/65 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between'
                  : 'mt-3 flex flex-col gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/55 via-white to-blue-50/30 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between'
        }
      >
        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-500">
            Estado de la propuesta
          </p>
          <p className="mt-0.5 text-[9px] leading-4 text-slate-600">
            {description}
          </p>
        </div>

        {canDecide ? (
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onRequestAdjustment}
              disabled={submitting}
            >
              Solicitar ajuste
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="!h-7 !px-2.5 !text-[8px] !text-red-600 hover:!bg-red-50"
              onClick={onReject}
              disabled={submitting}
            >
              Rechazar
            </Button>
            <Button
              size="sm"
              className="!h-7 !px-3 !text-[8px]"
              onClick={onApprove}
              disabled={submitting}
            >
              Aprobar cotización
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
