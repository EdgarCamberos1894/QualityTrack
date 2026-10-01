import { useEffect } from 'react'
import {
  formatQuotationDate,
  formatQuotationMoney,
} from '../model/quotationPresenter'
import type { QuotationPreviewData } from '../schemas/quotation.schema'
import type { QuotationDetailDto } from '../types/quotation.types'

interface QuotationPreviewDialogProps {
  quotation: QuotationDetailDto
  preview: QuotationPreviewData
  onClose: () => void
}

export function QuotationPreviewDialog({
  quotation,
  preview,
  onClose,
}: QuotationPreviewDialogProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const currency =
    preview.currency.trim().length === 3
      ? preview.currency.toUpperCase()
      : quotation.currency

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Vista previa de cotización"
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-5 py-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Vista del cliente
            </p>
            <h2 className="mt-0.5 text-[18px] font-bold tracking-tight text-slate-950">
              {quotation.quotationNumber}
            </h2>
            <p className="mt-1 text-[9px] text-slate-500">
              Revisión {quotation.revision} · {quotation.customerName}
            </p>
          </div>
          <p className="text-[8px] text-slate-400">Esc para volver</p>
        </div>

        <div className="grid gap-3 px-5 py-4 sm:grid-cols-3">
          <div>
            <p className="text-[9px] uppercase text-slate-400">Vigencia</p>
            <p className="mt-1 text-[10px] font-semibold text-slate-800">
              {formatQuotationDate(preview.validUntil || null)}
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase text-slate-400">
              Entrega estimada
            </p>
            <p className="mt-1 text-[10px] font-semibold text-slate-800">
              {formatQuotationDate(preview.estimatedDeliveryDate || null)}
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase text-slate-400">Moneda</p>
            <p className="mt-1 text-[10px] font-semibold text-slate-800">
              {currency}
            </p>
          </div>
        </div>

        <div className="mx-5 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[620px]">
            <thead className="bg-slate-50 text-left text-[9px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Concepto</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3 text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {preview.items.map((item, index) => (
                <tr
                  key={item.id ?? `preview-${index}`}
                  className="border-t border-slate-100 text-[10px]"
                >
                  <td className="px-4 py-3 text-slate-800">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {formatQuotationMoney(item.unitPrice, currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatQuotationMoney(
                      item.quantity * item.unitPrice,
                      currency,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="ml-auto w-full max-w-sm space-y-2 px-5 py-4 text-[10px]">
          <div className="flex justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="font-medium text-slate-900">
              {formatQuotationMoney(preview.totals.subtotal, currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Impuesto ({preview.taxRate}%)</dt>
            <dd className="font-medium text-slate-900">
              {formatQuotationMoney(preview.totals.tax, currency)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <dt className="font-semibold text-slate-950">Total</dt>
            <dd className="text-[14px] font-bold text-slate-950">
              {formatQuotationMoney(preview.totals.total, currency)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
