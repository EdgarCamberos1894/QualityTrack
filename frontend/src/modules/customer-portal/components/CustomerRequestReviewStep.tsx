import { Card } from '@/shared/components/ui/Card'
import type { CustomerRequestFormValues } from '../schemas/customerRequest.schemas'
import type { RequestDocumentUpload } from '../types/customerRequest.types'

interface CustomerRequestReviewStepProps {
  values: CustomerRequestFormValues
  documents: RequestDocumentUpload[]
  onEditDetails: () => void
  onEditRequirements: () => void
}

export function CustomerRequestReviewStep({
  values,
  documents,
  onEditDetails,
  onEditRequirements,
}: CustomerRequestReviewStepProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
      <Card className="p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-950">
            Resumen de la solicitud
          </h2>
          <button
            type="button"
            onClick={onEditDetails}
            className="text-[9px] font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Editar detalles
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-950">{values.title}</p>
          <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-5 text-slate-600">
            {values.description}
          </p>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-[8px] font-medium text-slate-500">Cantidad</p>
            <p className="mt-1 text-[10px] font-semibold text-slate-950">
              {values.quantity} piezas
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-[8px] font-medium text-slate-500">
              Fecha requerida
            </p>
            <p className="mt-1 text-[10px] font-semibold text-slate-950">
              {values.requestedDeliveryDate || 'Sin fecha'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-[8px] font-medium text-slate-500">
              Referencia cliente
            </p>
            <p className="mt-1 truncate text-[10px] font-semibold text-slate-950">
              {values.customerReference || 'Sin referencia'}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[11px] font-semibold text-slate-950">
              Requisitos técnicos
            </h3>
            <button
              type="button"
              onClick={onEditRequirements}
              className="text-[9px] font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Editar requisitos
            </button>
          </div>

          <div className="mt-2.5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[8px] font-medium text-slate-500">
                Definición
              </p>
              <p className="mt-1 text-[10px] font-semibold text-slate-800">
                {values.materialRequirementType === 'SPECIFIED'
                  ? 'Material especificado'
                  : 'Asesoría técnica requerida'}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-medium text-slate-500">
                Requisitos
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[10px] leading-5 text-slate-700">
                {values.materialRequirement}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-semibold text-slate-950">
            Documentos · {documents.length}
          </p>

          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {documents.length > 0 ? (
              documents.map((document, index) => (
                <div
                  key={`${document.file.name}-review-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/55 px-3 py-2"
                >
                  <p className="truncate text-[9px] font-semibold text-slate-800">
                    {document.file.name}
                  </p>
                  <p className="mt-0.5 text-[8px] text-slate-500">
                    {(document.file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              ))
            ) : (
              <p className="sm:col-span-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-center text-[9px] text-slate-500">
                Sin documentos adjuntos.
              </p>
            )}
          </div>
        </div>

        <p className="mt-3 text-[8px] text-slate-400">
          Los archivos se registrarán como versiones iniciales al enviar.
        </p>
      </Card>

      <div className="space-y-3">
        <Card className="p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.22)]">
          <h2 className="text-sm font-semibold text-slate-950">
            Antes de enviar
          </h2>

          <div className="mt-3 space-y-3">
            {[
              {
                title: 'La solicitud quedará registrada',
                detail: 'Podrás seguir su estado desde Solicitudes.',
              },
              {
                title: 'Puede haber preguntas',
                detail: 'Comercial puede pedir información adicional.',
              },
              {
                title: 'Aún no es una cotización',
                detail: 'Precio y condiciones se definen después.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-700">
                  ✓
                </span>
                <div>
                  <p className="text-[9px] font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-amber-300 bg-amber-50/70 p-4 shadow-none">
          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-amber-700">
            Si necesitas corregir algo
          </p>
          <p className="mt-2 text-[9px] leading-4 text-slate-700">
            Mientras la solicitud siga en revisión podrás modificarla. Los
            cambios quedarán en la actividad y, si afectan el análisis, la
            revisión puede reiniciarse.
          </p>
        </Card>
      </div>
    </div>
  )
}
