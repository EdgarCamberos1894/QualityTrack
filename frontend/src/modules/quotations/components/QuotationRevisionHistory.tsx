import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import { getQuotationStatusPresentation } from '../model/quotationPresenter'
import type { QuotationDto } from '../types/quotation.types'

interface QuotationRevisionHistoryProps {
  revisions: QuotationDto[]
  currentId: number
}

export function QuotationRevisionHistory({
  revisions,
  currentId,
}: QuotationRevisionHistoryProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-xs font-semibold text-slate-950">
        Historial de revisiones
      </h2>

      <div className="mt-3 space-y-2">
        {revisions.map((revision) => {
          const status = getQuotationStatusPresentation(revision.status)
          const current = revision.id === currentId

          return (
            <Link
              key={revision.id}
              to={`/quotations/${revision.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 transition hover:bg-slate-50"
            >
              <div>
                <p className="text-[11px] font-semibold text-slate-900">
                  Rev {revision.revision}
                  {current ? ' · Actual' : ''}
                </p>
                <p className="mt-1 text-[9px] text-slate-500">
                  {revision.quotationNumber}
                </p>
              </div>
              <Badge tone={status.tone} className="text-[9px]">
                {status.label}
              </Badge>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
