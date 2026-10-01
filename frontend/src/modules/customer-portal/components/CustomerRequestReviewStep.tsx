import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import type { CustomerRequestFormValues } from '../schemas/customerRequest.schemas'
import type { RequestDocumentUpload } from '../types/customerRequest.types'

interface CustomerRequestReviewStepProps {
  values: CustomerRequestFormValues
  documents: RequestDocumentUpload[]
}

export function CustomerRequestReviewStep({
  values,
  documents,
}: CustomerRequestReviewStepProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,730px)_360px]">
      <Card className="relative overflow-hidden p-5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.32)]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-400" />

        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <SidebarNavIcon name="quality" className="h-[17px] w-[17px]" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              Confirmación
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
              Resumen de la solicitud
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Revisa la información antes de enviarla al equipo.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/55 p-4">
            <p className="text-sm font-semibold text-slate-950">
              {values.title}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-[10px] leading-5 text-slate-600">
              {values.description}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                Cantidad
              </p>
              <p className="mt-1 text-[10px] font-semibold text-slate-950">
                {values.quantity} piezas
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                Fecha requerida
              </p>
              <p className="mt-1 text-[10px] font-semibold text-slate-950">
                {values.requestedDeliveryDate || 'Sin fecha'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                Referencia cliente
              </p>
              <p className="mt-1 truncate text-[10px] font-semibold text-slate-950">
                {values.customerReference || 'Sin referencia'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/55 p-4">
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Requisitos técnicos
            </p>
            <p className="mt-2 whitespace-pre-wrap text-[10px] leading-5 text-slate-700">
              {values.materialRequirement}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Documentos
              </p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold text-slate-600">
                {documents.length}
              </span>
            </div>
            <div className="mt-2 space-y-2">
              {documents.length > 0 ? (
                documents.map((document, index) => (
                  <div
                    key={`${document.file.name}-review-${index}`}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <SidebarNavIcon
                        name="documents"
                        className="h-3.5 w-3.5"
                      />
                    </div>
                    <p className="truncate text-[9px] font-medium text-slate-700">
                      {document.file.name}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-center text-[9px] text-slate-500">
                  Sin documentos adjuntos.
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="h-fit overflow-hidden border-slate-200 bg-slate-50/75 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.24)]">
        <div className="border-b border-slate-200 bg-white px-4 py-3.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Última revisión
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
            Antes de enviar
          </h2>
        </div>

        <ul className="space-y-0 px-4 py-2">
          {[
            'La solicitud quedará registrada.',
            'Comercial puede pedir información adicional.',
            'Precio y condiciones se definen después.',
          ].map((item) => (
            <li
              key={item}
              className="flex gap-2.5 border-b border-slate-200/70 py-3 last:border-b-0"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700">
                ✓
              </span>
              <p className="text-[10px] leading-5 text-slate-600">{item}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
