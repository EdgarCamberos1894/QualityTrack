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
    <aside className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-950">
        Resumen comercial
      </h2>

      <dl className="mt-5 space-y-3 text-xs">
        <div className="flex justify-between gap-4 text-slate-600">
          <dt>Subtotal</dt>
          <dd className="font-medium text-slate-900">
            {formatQuotationMoney(totals.subtotal, safeCurrency)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 text-slate-600">
          <dt>Impuesto ({Number.isFinite(taxRate) ? taxRate : 0}%)</dt>
          <dd className="font-medium text-slate-900">
            {formatQuotationMoney(totals.tax, safeCurrency)}
          </dd>
        </div>
        <div className="border-t border-slate-200 pt-3">
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-slate-950">Total</dt>
            <dd className="text-base font-bold text-slate-950">
              {formatQuotationMoney(totals.total, safeCurrency)}
            </dd>
          </div>
        </div>
      </dl>

      <p className="mt-4 text-[9px] leading-4 text-slate-500">
        El backend recalcula y valida los importes al guardar.
      </p>
    </aside>
  )
}
