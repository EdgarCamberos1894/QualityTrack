import {
  formatQuotationDate,
  formatQuotationMoney,
} from '../model/quotationPresenter'
import type { CustomerQuotationDetailDto } from '../types/customerQuotation.types'

interface CustomerQuotationDocumentProps {
  quotation: CustomerQuotationDetailDto
  customerName: string
}

export function CustomerQuotationDocument({
  quotation,
  customerName,
}: CustomerQuotationDocumentProps) {
  const printQuotation = () => {
    const previousTitle = document.title

    document.title = `${quotation.quotationNumber}-Rev-${quotation.revision}`
    document.body.classList.add('printing-customer-quotation')

    try {
      window.print()
    } finally {
      document.body.classList.remove('printing-customer-quotation')
      document.title = previousTitle
    }
  }

  const material = [
    quotation.source.materialName,
    quotation.source.standardOrGrade,
  ]
    .filter(Boolean)
    .join(' / ')

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.3)]">
      <div className="customer-quotation-print-hidden mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Propuesta comercial
          </p>
          <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
            Detalle de cotización
          </h2>
          <p className="mt-0.5 text-[8px] text-slate-500">
            Vista del documento enviado por Comercial.
          </p>
        </div>

        <button
          type="button"
          onClick={printQuotation}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-[8px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 8V3h10v5" />
            <rect x="5" y="14" width="14" height="7" rx="1.5" />
            <path d="M5 17H3V10a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7h-2" />
            <path d="M17 11h.01" />
          </svg>
          Imprimir
        </button>
      </div>

      <article className="customer-quotation-print-area overflow-hidden rounded-xl border border-slate-200 bg-white px-5 py-5 sm:px-6 sm:py-6">
        <header className="flex items-start justify-between gap-5 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-[8px] font-bold tracking-[0.08em] text-white">
              QT
            </div>
            <p className="text-[14px] font-bold tracking-tight text-slate-950">
              QualityTrack
            </p>
          </div>

          <div className="text-right">
            <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-blue-600">
              Cotización
            </p>
            <p className="mt-1 text-[12px] font-bold text-slate-950">
              {quotation.quotationNumber} · Rev. {quotation.revision}
            </p>
          </div>
        </header>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1.55fr_0.65fr_0.65fr]">
          <div>
            <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Cliente
            </p>
            <p className="mt-1 text-[10px] font-semibold text-slate-900">
              {customerName}
            </p>
            <p className="mt-1 text-[8px] text-slate-400">
              {quotation.caseNumber} · {quotation.requestNumber}
            </p>
          </div>

          <div>
            <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Válida hasta
            </p>
            <p className="mt-1 text-[9px] font-semibold text-slate-900">
              {formatQuotationDate(quotation.validUntil)}
            </p>
          </div>

          <div>
            <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Entrega estimada
            </p>
            <p className="mt-1 text-[9px] font-semibold text-slate-900">
              {formatQuotationDate(quotation.estimatedDeliveryDate)}
            </p>
          </div>
        </div>

        <section className="mt-6">
          <h3 className="text-[11px] font-semibold text-slate-950">
            Alcance comercial
          </h3>

          <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/65">
            {quotation.items.map((item, index) => (
              <div
                key={item.id}
                className={
                  index === 0
                    ? 'grid gap-3 px-3.5 py-3.5 sm:grid-cols-[minmax(0,1fr)_120px_120px]'
                    : 'grid gap-3 border-t border-slate-200 px-3.5 py-3.5 sm:grid-cols-[minmax(0,1fr)_120px_120px]'
                }
              >
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold leading-4 text-slate-900">
                    {item.description}
                  </p>
                  {index === 0 ? (
                    <p className="mt-1 text-[7px] leading-3.5 text-slate-400">
                      {material ||
                        quotation.source.materialRequirement ||
                        'Según especificación técnica de la solicitud'}
                    </p>
                  ) : null}
                </div>

                <p className="self-center text-right text-[8px] text-slate-600">
                  {item.quantity} ×{' '}
                  {formatQuotationMoney(item.unitPrice, quotation.currency)}
                </p>

                <p className="self-center text-right text-[10px] font-bold text-slate-950">
                  {formatQuotationMoney(item.subtotal, quotation.currency)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-7 grid gap-6 sm:grid-cols-[1fr_0.72fr]">
          <section>
            <h3 className="text-[9px] font-semibold text-slate-950">
              Condiciones
            </h3>
            <ul className="mt-2 space-y-1 text-[7px] leading-3.5 text-slate-600">
              <li>• Precios expresados en {quotation.currency}.</li>
              <li>
                • Vigencia hasta el {formatQuotationDate(quotation.validUntil)}.
              </li>
              <li>
                • Entrega estimada:{' '}
                {formatQuotationDate(quotation.estimatedDeliveryDate)}.
              </li>
              <li>
                • La aprobación de esta propuesta no crea automáticamente la
                orden de trabajo.
              </li>
            </ul>
          </section>

          <dl className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[7px] text-slate-500">Subtotal</dt>
              <dd className="text-[9px] font-semibold text-slate-900">
                {formatQuotationMoney(quotation.subtotal, quotation.currency)}
              </dd>
            </div>

            <div className="mt-2 flex items-center justify-between gap-4">
              <dt className="text-[7px] text-slate-500">
                IVA · {quotation.taxRate}%
              </dt>
              <dd className="text-[9px] font-semibold text-slate-900">
                {formatQuotationMoney(quotation.tax, quotation.currency)}
              </dd>
            </div>

            <div className="mt-3 flex items-end justify-between gap-4 border-t border-slate-200 pt-3">
              <dt className="text-[7px] font-bold uppercase tracking-[0.06em] text-slate-700">
                Total
              </dt>
              <dd className="text-[14px] font-bold tracking-tight text-slate-950">
                {formatQuotationMoney(quotation.total, quotation.currency)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-7 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-3">
          <p className="text-[7px] leading-4 text-slate-600">
            Esta vista representa la cotización vigente para esta revisión. Al
            imprimir puedes enviarla a una impresora o guardarla como PDF desde
            las opciones del navegador.
          </p>
        </div>
      </article>

      {quotation.adjustment?.notes || quotation.adjustment?.response ? (
        <div className="customer-quotation-print-hidden mt-3 rounded-xl border border-amber-100 bg-amber-50/50 px-3.5 py-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-amber-700">
            Seguimiento del ajuste
          </p>
          {quotation.adjustment.notes ? (
            <p className="mt-1.5 text-[9px] leading-4 text-slate-700">
              <span className="font-semibold">Tu solicitud: </span>
              {quotation.adjustment.notes}
            </p>
          ) : null}
          <p className="mt-1 text-[9px] leading-4 text-slate-700">
            <span className="font-semibold">Respuesta comercial: </span>
            {quotation.adjustment.response ?? 'pendiente.'}
          </p>
        </div>
      ) : null}
    </section>
  )
}
