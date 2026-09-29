import { formatQuotationMoney } from '../model/quotationPresenter'
import type { CustomerQuotationDetailDto } from '../types/customerQuotation.types'

interface CustomerQuotationDocumentProps {
  quotation: CustomerQuotationDetailDto
}

export function CustomerQuotationDocument({
  quotation,
}: CustomerQuotationDocumentProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[650px]">
          <thead className="bg-slate-50 text-left text-[9px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Concepto</th>
              <th className="px-4 py-3 text-right">Cantidad</th>
              <th className="px-4 py-3 text-right">Precio unitario</th>
              <th className="px-4 py-3 text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-slate-100 text-xs text-slate-700"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.description}
                </td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">
                  {formatQuotationMoney(item.unitPrice, quotation.currency)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                  {formatQuotationMoney(item.subtotal, quotation.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="ml-auto mt-5 w-full max-w-sm space-y-2 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Subtotal</dt>
          <dd className="font-medium text-slate-900">
            {formatQuotationMoney(quotation.subtotal, quotation.currency)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Impuesto ({quotation.taxRate}%)</dt>
          <dd className="font-medium text-slate-900">
            {formatQuotationMoney(quotation.tax, quotation.currency)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
          <dt className="font-semibold text-slate-950">Total</dt>
          <dd className="text-base font-bold text-slate-950">
            {formatQuotationMoney(quotation.total, quotation.currency)}
          </dd>
        </div>
      </dl>
    </section>
  )
}
