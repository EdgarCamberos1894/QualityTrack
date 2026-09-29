import type { QuotationDetailDto } from '../types/quotation.types'

interface QuotationAdjustmentCardProps {
  quotation: QuotationDetailDto
}

export function QuotationAdjustmentCard({
  quotation,
}: QuotationAdjustmentCardProps) {
  if (!quotation.adjustmentNotes) return null

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
        Solicitud de ajuste del cliente
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-800">
        {quotation.adjustmentNotes}
      </p>

      {quotation.adjustmentResponse ? (
        <div className="mt-3 rounded-lg bg-white/70 p-3">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            Respuesta enviada
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-700">
            {quotation.adjustmentResponse}
          </p>
        </div>
      ) : null}
    </section>
  )
}
