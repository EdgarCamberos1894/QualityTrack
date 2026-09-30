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
    <div className="grid gap-5 xl:grid-cols-[minmax(0,730px)_360px]">
      <Card className="p-5">
        <h2 className="text-base font-semibold text-slate-950">
          Resumen de la solicitud
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <p className="text-sm font-semibold text-slate-950">
              {values.title}
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-600">
              {values.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[9px] text-slate-500">Cantidad</p>
              <p className="mt-1 text-xs font-semibold text-slate-950">
                {values.quantity} piezas
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[9px] text-slate-500">Fecha requerida</p>
              <p className="mt-1 text-xs font-semibold text-slate-950">
                {values.requestedDeliveryDate || 'Sin fecha'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[9px] text-slate-500">Referencia cliente</p>
              <p className="mt-1 text-xs font-semibold text-slate-950">
                {values.customerReference || 'Sin referencia'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
              Requisitos técnicos
            </p>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-700">
              {values.materialRequirement}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
              Documentos · {documents.length}
            </p>
            <div className="mt-2 space-y-2">
              {documents.length > 0 ? (
                documents.map((document, index) => (
                  <div
                    key={`${document.file.name}-review-${index}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] text-slate-700"
                  >
                    {document.file.name}
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-500">
                  Sin documentos adjuntos.
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="h-fit p-5">
        <h2 className="text-sm font-semibold text-slate-950">
          Antes de enviar
        </h2>
        <ul className="mt-4 space-y-3 text-[10px] leading-5 text-slate-600">
          <li>✓ La solicitud quedará registrada.</li>
          <li>✓ Comercial puede pedir información adicional.</li>
          <li>✓ Precio y condiciones se definen después.</li>
        </ul>
      </Card>
    </div>
  )
}
