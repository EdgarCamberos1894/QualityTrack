import { formatQuotationMoney } from '../model/quotationPresenter'
import type { QuotationFormTotals } from '../schemas/quotation.schema'

interface QuotationTotalsCardProps {
  totals: QuotationFormTotals
  currency: string
  taxRate: number
}

export function QuotationTotalsCard({
  totals,
  currency,
  taxRate,
}: QuotationTotalsCardProps) {
  const safeCurrency =
    currency.trim().length === 3 ? currency.toUpperCase() : 'MXN'

  return (
    <aside className="h-fit overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)] xl:sticky xl:top-[88px]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-3.5 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Resumen comercial
        </p>
        <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
          Totales de la revisión
        </h2>
      </div>

      <dl className="space-y-2 px-3.5 py-3 text-[9px]">
        <div className="flex justify-between gap-4 text-slate-500">
          <dt>Subtotal</dt>
          <dd className="font-medium text-slate-800">
            {formatQuotationMoney(totals.subtotal, safeCurrency)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 text-slate-500">
          <dt>Impuesto ({Number.isFinite(taxRate) ? taxRate : 0}%)</dt>
          <dd className="font-medium text-slate-800">
            {formatQuotationMoney(totals.tax, safeCurrency)}
          </dd>
        </div>
        <div className="border-t border-slate-200 pt-2.5">
          <div className="flex items-end justify-between gap-4">
            <dt className="font-semibold text-slate-900">Total</dt>
            <dd className="text-[15px] font-bold tracking-tight text-slate-950">
              {formatQuotationMoney(totals.total, safeCurrency)}
            </dd>
          </div>
        </div>
      </dl>

      <p className="border-t border-slate-100 bg-slate-50/60 px-3.5 py-2 text-[7px] leading-3 text-slate-400">
        Los importes se recalculan y validan en backend al guardar o enviar.
      </p>
    </aside>
  )
}
