import { useNavigate } from 'react-router-dom'
import { CompactBackButton } from '@/shared/components/navigation/CompactBackButton'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import {
  formatQuotationDate,
  formatQuotationMoney,
  getQuotationStatusPresentation,
} from '../model/quotationPresenter'
import type { QuotationDetailDto } from '../types/quotation.types'

interface QuotationDetailHeaderProps {
  quotation: QuotationDetailDto
}

export function QuotationDetailHeader({
  quotation,
}: QuotationDetailHeaderProps) {
  const navigate = useNavigate()
  const status = getQuotationStatusPresentation(quotation.status)
  const hasAdjustment =
    quotation.status === 'DRAFT' && Boolean(quotation.adjustmentNotes)

  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
      <div className="px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="quotations" className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Cotización interna
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] font-bold tracking-tight text-slate-950">
                  {quotation.quotationNumber}
                </h1>
                <Badge
                  tone={hasAdjustment ? 'warning' : status.tone}
                  className="px-2 py-0.5 text-[8px]"
                >
                  {hasAdjustment ? 'Ajuste pendiente' : status.label}
                </Badge>
              </div>
              <p className="mt-1 truncate text-[10px] font-medium text-slate-600">
                Revisión {quotation.revision} · {quotation.customerName}
              </p>
            </div>
          </div>

          <CompactBackButton
            label="Volver a cotizaciones"
            onClick={() => navigate('/quotations')}
          />
        </div>

        <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
          <div className="py-1 sm:pr-4">
            <p className="text-[8px] font-medium text-slate-400">Total</p>
            <p className="mt-0.5 text-[12px] font-bold text-slate-950">
              {formatQuotationMoney(quotation.total, quotation.currency)}
            </p>
          </div>
          <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
            <p className="text-[8px] font-medium text-slate-400">Vigencia</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-800">
              {formatQuotationDate(quotation.validUntil)}
            </p>
          </div>
          <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
            <p className="text-[8px] font-medium text-slate-400">Entrega estimada</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-800">
              {formatQuotationDate(quotation.estimatedDeliveryDate)}
            </p>
          </div>
          <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:pl-4 sm:py-1">
            <p className="text-[8px] font-medium text-slate-400">Responsable</p>
            <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-800">
              {quotation.source.assignedToName ?? 'Sin asignar'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
