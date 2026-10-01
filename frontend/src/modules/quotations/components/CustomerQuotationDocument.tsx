import {
  formatQuotationDate,
  formatQuotationMoney,
} from '../model/quotationPresenter'
import type { CustomerQuotationDetailDto } from '../types/customerQuotation.types'

interface CustomerQuotationDocumentProps {
  quotation: CustomerQuotationDetailDto
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-medium text-slate-500">{label}</p>
      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-[11px] font-medium text-slate-700">
        {value}
      </div>
    </div>
  )
}

function AdjustmentSummary({
  quotation,
}: {
  quotation: CustomerQuotationDetailDto
}) {
  const adjustment = quotation.adjustment

  if (!adjustment?.notes && !adjustment?.response) {
    return (
      <div className="rounded-[10px] border border-blue-200 bg-blue-50 p-3 text-[9px] leading-5 text-slate-700">
        Cotización enviada · importes, vigencia y entrega son de solo lectura.
      </div>
    )
  }

  return (
    <div className="rounded-[10px] border border-blue-200 bg-blue-50 p-3 text-[9px] leading-5 text-slate-700">
      {adjustment.notes ? (
        <p>
          <span className="font-semibold">
            {quotation.customerStatus === 'ADJUSTMENT_REQUESTED'
              ? 'Tu solicitud: '
              : 'Solicitaste: '}
          </span>
          {adjustment.notes}
        </p>
      ) : null}
      <p className={adjustment.notes ? 'mt-1' : undefined}>
        <span className="font-semibold">Respuesta comercial: </span>
        {adjustment.response ?? 'pendiente.'}
      </p>
    </div>
  )
}

export function CustomerQuotationDocument({
  quotation,
}: CustomerQuotationDocumentProps) {
  return (
    <section className="grid gap-5 @5xl/page:grid-cols-[minmax(0,1fr)_332px]">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-[15px] font-semibold text-slate-950">
          Detalle de cotización
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <ReadOnlyField label="Moneda" value={quotation.currency} />
          <ReadOnlyField
            label="Válida hasta"
            value={formatQuotationDate(quotation.validUntil)}
          />
          <ReadOnlyField
            label="Entrega estimada"
            value={formatQuotationDate(quotation.estimatedDeliveryDate)}
          />
        </div>

        <p className="mt-3 text-[9px] leading-5 text-slate-500">
          La fecha solicitada por el cliente es{' '}
          {formatQuotationDate(quotation.source.requestedDeliveryDate)}; esta es
          la fecha que estamos comprometiendo en la propuesta.
        </p>

        <div className="mt-5 overflow-x-auto rounded-[10px] border border-slate-200 bg-slate-50">
          <div className="px-4 pt-4">
            <h3 className="text-xs font-semibold text-slate-950">Conceptos</h3>
          </div>
          <table className="mt-3 w-full min-w-[650px]">
            <thead className="text-left text-[8px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3 text-right">Cant.</th>
                <th className="px-4 py-3 text-right">P. unit.</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-200 text-[11px] text-slate-700"
                >
                  <td className="px-4 py-4 font-medium text-slate-950">
                    {item.description}
                  </td>
                  <td className="px-4 py-4 text-right">{item.quantity}</td>
                  <td className="px-4 py-4 text-right">
                    {formatQuotationMoney(item.unitPrice, quotation.currency)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-950">
                    {formatQuotationMoney(item.subtotal, quotation.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-[15px] font-semibold text-slate-950">Resumen</h2>

        <dl className="mt-6 space-y-5 text-[10px]">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="text-xs font-semibold text-slate-950">
              {formatQuotationMoney(quotation.subtotal, quotation.currency)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500">IVA · {quotation.taxRate}%</dt>
            <dd className="text-xs font-semibold text-slate-950">
              {formatQuotationMoney(quotation.tax, quotation.currency)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-950">Total</dt>
            <dd className="text-base font-bold text-slate-950">
              {formatQuotationMoney(quotation.total, quotation.currency)}
            </dd>
          </div>
        </dl>

        <div className="my-5 h-px bg-slate-200" />

        <h3 className="text-[10px] font-semibold text-slate-950">
          Condiciones
        </h3>
        <ul className="mt-3 space-y-2 text-[10px] leading-5 text-slate-700">
          <li>• Vigencia: hasta {formatQuotationDate(quotation.validUntil)}</li>
          <li>
            • Entrega estimada:{' '}
            {formatQuotationDate(quotation.estimatedDeliveryDate)}
          </li>
          <li>
            • Precios en {quotation.currency} + impuestos incluidos en total
          </li>
        </ul>

        <div className="mt-6">
          <AdjustmentSummary quotation={quotation} />
        </div>
      </aside>
    </section>
  )
}
