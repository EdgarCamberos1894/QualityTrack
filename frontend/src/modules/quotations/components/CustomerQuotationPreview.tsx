import { useEffect, useState } from 'react'
import {
  formatQuotationDate,
  formatQuotationMoney,
} from '../model/quotationPresenter'
import type { CustomerQuotationDetailDto } from '../types/customerQuotation.types'

interface CustomerQuotationPreviewProps {
  quotation: CustomerQuotationDetailDto
  customerName: string
}

interface QuotationPaperProps extends CustomerQuotationPreviewProps {
  compact?: boolean
}

function QuotationPaper({
  quotation,
  customerName,
  compact = false,
}: QuotationPaperProps) {
  const itemCount = quotation.items.length

  return (
    <article
      className={
        compact
          ? 'mx-auto w-full max-w-[900px] rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.45)]'
          : 'mx-auto w-full max-w-[980px] rounded-xl border border-slate-200 bg-white px-7 py-7 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.5)] sm:px-9 sm:py-8'
      }
    >
      <div className="flex items-start justify-between gap-5 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={
              compact
                ? 'flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-[8px] font-bold tracking-[0.08em] text-white'
                : 'flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-[9px] font-bold tracking-[0.08em] text-white'
            }
          >
            QT
          </div>
          <div>
            <p
              className={
                compact
                  ? 'text-[13px] font-bold text-slate-950'
                  : 'text-base font-bold text-slate-950'
              }
            >
              QualityTrack
            </p>
            {!compact ? (
              <p className="mt-0.5 text-[9px] text-slate-400">
                Propuesta comercial
              </p>
            ) : null}
          </div>
        </div>

        <div className="text-right">
          <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-blue-600">
            Cotización
          </p>
          <p
            className={
              compact
                ? 'mt-1 text-[11px] font-bold text-slate-950'
                : 'mt-1 text-sm font-bold text-slate-950'
            }
          >
            {quotation.quotationNumber} · Rev. {quotation.revision}
          </p>
        </div>
      </div>

      <div
        className={
          compact
            ? 'mt-4 grid gap-3 sm:grid-cols-[1.5fr_0.65fr_0.65fr]'
            : 'mt-5 grid gap-4 sm:grid-cols-[1.5fr_0.65fr_0.65fr]'
        }
      >
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

      <div className={compact ? 'mt-5' : 'mt-7'}>
        <h3
          className={
            compact
              ? 'text-[11px] font-semibold text-slate-950'
              : 'text-sm font-semibold text-slate-950'
          }
        >
          Alcance comercial
        </h3>

        <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70">
          {quotation.items.map((item, index) => (
            <div
              key={item.id}
              className={
                index > 0
                  ? 'grid gap-3 border-t border-slate-200 px-3.5 py-3 sm:grid-cols-[minmax(0,1fr)_120px_120px]'
                  : 'grid gap-3 px-3.5 py-3 sm:grid-cols-[minmax(0,1fr)_120px_120px]'
              }
            >
              <div className="min-w-0">
                <p className="text-[9px] font-semibold leading-4 text-slate-900">
                  {item.description}
                </p>
                {index === 0 ? (
                  <p className="mt-1 text-[7px] text-slate-400">
                    {quotation.source.materialName ||
                      quotation.source.materialRequirement ||
                      'Especificación técnica según solicitud'}
                    {quotation.source.standardOrGrade
                      ? ` · ${quotation.source.standardOrGrade}`
                      : ''}
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
      </div>

      <div
        className={
          compact
            ? 'mt-5 grid gap-4 sm:grid-cols-[1fr_0.72fr]'
            : 'mt-7 grid gap-6 sm:grid-cols-[1fr_0.72fr]'
        }
      >
        <div>
          <h3 className="text-[9px] font-semibold text-slate-950">Condiciones</h3>
          <ul className="mt-2 space-y-1 text-[7px] leading-3.5 text-slate-600">
            <li>• Precios expresados en {quotation.currency}.</li>
            <li>• Vigencia hasta el {formatQuotationDate(quotation.validUntil)}.</li>
            <li>
              • Entrega estimada: {formatQuotationDate(quotation.estimatedDeliveryDate)}.
            </li>
            <li>
              • La aprobación de esta propuesta no crea automáticamente la orden de trabajo.
            </li>
          </ul>
        </div>

        <dl className="rounded-xl border border-slate-200 bg-slate-50/75 px-3.5 py-3">
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
            <dd
              className={
                compact
                  ? 'text-[13px] font-bold text-slate-950'
                  : 'text-base font-bold text-slate-950'
              }
            >
              {formatQuotationMoney(quotation.total, quotation.currency)}
            </dd>
          </div>
        </dl>
      </div>

      {!compact ? (
        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
          <p className="text-[8px] leading-4 text-slate-600">
            Esta vista representa la información vigente de esta revisión. El PDF,
            si se genera, es una representación de estos mismos datos y no la fuente
            de verdad.
          </p>
        </div>
      ) : null}

      {compact && itemCount > 2 ? (
        <p className="mt-3 text-center text-[7px] text-slate-400">
          {itemCount} conceptos incluidos en esta revisión.
        </p>
      ) : null}
    </article>
  )
}

export function CustomerQuotationPreview({
  quotation,
  customerName,
}: CustomerQuotationPreviewProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
      <section className="rounded-xl border border-blue-100/80 bg-gradient-to-br from-blue-50/45 via-white to-slate-50/70 p-3.5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Documento comercial
            </p>
            <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
              Vista previa de la cotización
            </h2>
            <p className="mt-0.5 text-[8px] text-slate-500">
              Así se presenta esta revisión como documento.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-7 shrink-0 items-center rounded-lg border border-blue-200 bg-white px-2.5 text-[8px] font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
          >
            Ver en grande
          </button>
        </div>

        <div className="relative max-h-[330px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100/70 p-3 sm:p-4">
          <QuotationPaper
            quotation={quotation}
            customerName={customerName}
            compact
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-100/95 to-transparent" />
        </div>
      </section>

      {open ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[1px]"
          onMouseDown={() => setOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Vista previa de cotización"
            className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-slate-100 p-3 shadow-2xl sm:p-5"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-4 px-1">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                  Vista del cliente
                </p>
                <p className="mt-0.5 text-[9px] text-slate-500">
                  {quotation.quotationNumber} · Revisión {quotation.revision}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar vista previa"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <QuotationPaper quotation={quotation} customerName={customerName} />
          </section>
        </div>
      ) : null}
    </>
  )
}
