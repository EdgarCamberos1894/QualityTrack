import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
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
    <div className="rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2.5">
      <p className="text-[8px] font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-[10px] font-semibold text-slate-900">{value}</p>
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
      <div className="rounded-xl border border-blue-100 bg-blue-50/55 px-3 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-blue-700">
          Propuesta vigente
        </p>
        <p className="mt-1 text-[9px] leading-4 text-slate-600">
          Importes, vigencia y entrega corresponden a la revisión enviada por Comercial.
        </p>
      </div>
    )
  }

  const waiting = quotation.customerStatus === 'ADJUSTMENT_REQUESTED'

  return (
    <div
      className={
        waiting
          ? 'rounded-xl border border-amber-200 bg-amber-50/65 px-3 py-2.5'
          : 'rounded-xl border border-emerald-100 bg-emerald-50/55 px-3 py-2.5'
      }
    >
      <p
        className={
          waiting
            ? 'text-[8px] font-bold uppercase tracking-[0.08em] text-amber-700'
            : 'text-[8px] font-bold uppercase tracking-[0.08em] text-emerald-700'
        }
      >
        {waiting ? 'Ajuste en proceso' : 'Ajuste respondido'}
      </p>

      {adjustment.notes ? (
        <div className="mt-2">
          <p className="text-[8px] font-semibold text-slate-500">Tu solicitud</p>
          <p className="mt-0.5 text-[9px] leading-4 text-slate-700">
            {adjustment.notes}
          </p>
        </div>
      ) : null}

      <div className="mt-2">
        <p className="text-[8px] font-semibold text-slate-500">
          Respuesta comercial
        </p>
        <p className="mt-0.5 text-[9px] leading-4 text-slate-700">
          {adjustment.response ?? 'Pendiente.'}
        </p>
      </div>
    </div>
  )
}

export function CustomerQuotationDocument({
  quotation,
}: CustomerQuotationDocumentProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
      <div className="rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/25 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)]">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <SidebarNavIcon name="quotations" className="h-[17px] w-[17px]" />
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Propuesta comercial
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
              Detalle de cotización
            </h2>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
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

        <p className="mt-2.5 text-[8px] leading-4 text-slate-500">
          Fecha solicitada originalmente:{' '}
          <span className="font-semibold text-slate-700">
            {formatQuotationDate(quotation.source.requestedDeliveryDate)}
          </span>
          . La entrega estimada corresponde al compromiso de esta propuesta.
        </p>

        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white/90">
          <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5">
            <h3 className="text-[10px] font-semibold text-slate-950">
              Conceptos
            </h3>
            <span className="text-[8px] font-medium text-slate-400">
              {quotation.items.length} partida{quotation.items.length === 1 ? '' : 's'}
            </span>
          </div>

          <table className="w-full min-w-[620px]">
            <thead className="bg-slate-50/70 text-left text-[8px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3.5 py-2.5">Descripción</th>
                <th className="px-3.5 py-2.5 text-right">Cant.</th>
                <th className="px-3.5 py-2.5 text-right">P. unit.</th>
                <th className="px-3.5 py-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-100 text-[10px] text-slate-700"
                >
                  <td className="px-3.5 py-3 font-medium text-slate-900">
                    {item.description}
                  </td>
                  <td className="px-3.5 py-3 text-right">{item.quantity}</td>
                  <td className="px-3.5 py-3 text-right">
                    {formatQuotationMoney(item.unitPrice, quotation.currency)}
                  </td>
                  <td className="px-3.5 py-3 text-right font-semibold text-slate-950">
                    {formatQuotationMoney(item.subtotal, quotation.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/20 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.24)]">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <SidebarNavIcon name="cases" className="h-[17px] w-[17px]" />
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Resumen económico
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
              Total de la propuesta
            </h2>
          </div>
        </div>

        <dl className="mt-3 divide-y divide-slate-100 border-y border-slate-100">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[8px] text-slate-500">Subtotal</dt>
            <dd className="text-[10px] font-semibold text-slate-900">
              {formatQuotationMoney(quotation.subtotal, quotation.currency)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[8px] text-slate-500">IVA · {quotation.taxRate}%</dt>
            <dd className="text-[10px] font-semibold text-slate-900">
              {formatQuotationMoney(quotation.tax, quotation.currency)}
            </dd>
          </div>
        </dl>

        <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/65 px-3.5 py-3">
          <div className="flex items-end justify-between gap-4">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-blue-700">
              Total
            </p>
            <p className="text-base font-bold tracking-tight text-slate-950">
              {formatQuotationMoney(quotation.total, quotation.currency)}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Condiciones
          </p>
          <dl className="mt-1.5 divide-y divide-slate-100 text-[9px]">
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-slate-500">Vigencia</dt>
              <dd className="text-right font-medium text-slate-700">
                {formatQuotationDate(quotation.validUntil)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-slate-500">Entrega estimada</dt>
              <dd className="text-right font-medium text-slate-700">
                {formatQuotationDate(quotation.estimatedDeliveryDate)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-slate-500">Moneda</dt>
              <dd className="text-right font-medium text-slate-700">
                {quotation.currency}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-3">
          <AdjustmentSummary quotation={quotation} />
        </div>
      </aside>
    </section>
  )
}
