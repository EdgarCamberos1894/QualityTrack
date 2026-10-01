import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import {
  formatQuotationDate,
  formatQuotationMoney,
  getQuotationStatusPresentation,
} from '../model/quotationPresenter'
import type { QuotationDto } from '../types/quotation.types'

interface QuotationTableProps {
  quotations: QuotationDto[]
}

export function QuotationTable({ quotations }: QuotationTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[940px] border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-white text-left text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
            <th className="px-4 py-2.5">Cotización</th>
            <th className="px-4 py-2.5">Cliente</th>
            <th className="px-4 py-2.5">Estado</th>
            <th className="px-4 py-2.5">Total</th>
            <th className="px-4 py-2.5">Vigencia</th>
            <th className="px-4 py-2.5">Entrega</th>
            <th className="px-4 py-2.5 text-right">Acción</th>
          </tr>
        </thead>

        <tbody>
          {quotations.map((quotation) => {
            const status = getQuotationStatusPresentation(quotation.status)

            return (
              <tr
                key={quotation.id}
                className="group border-b border-slate-100 text-[10px] text-slate-600 transition last:border-0 hover:bg-blue-50/30"
              >
                <td className="px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                      <SidebarNavIcon name="quotations" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <Link
                        to={`/quotations/${quotation.id}`}
                        className="block truncate text-[11px] font-semibold text-slate-950 transition group-hover:text-blue-700"
                      >
                        {quotation.quotationNumber}
                      </Link>
                      <p className="mt-0.5 text-[8px] text-slate-400">
                        Rev {quotation.revision} · {quotation.caseNumber}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="max-w-[210px] px-4 py-3">
                  <p className="truncate font-medium text-slate-700">
                    {quotation.customerName}
                  </p>
                  <p className="mt-0.5 truncate text-[8px] text-slate-400">
                    {quotation.requestNumber}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
                    {status.label}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {formatQuotationMoney(quotation.total, quotation.currency)}
                </td>
                <td className="px-4 py-3">
                  {formatQuotationDate(quotation.validUntil)}
                </td>
                <td className="px-4 py-3">
                  {formatQuotationDate(quotation.estimatedDeliveryDate)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/quotations/${quotation.id}`}
                    className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Abrir
                    <svg
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 10h8" />
                      <path d="m11 7 3 3-3 3" />
                    </svg>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
