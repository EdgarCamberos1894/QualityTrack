import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import {
  formatJobCaseDate,
  formatJobCaseDateTime,
  getJobCaseClarificationSummary,
  getJobCaseMaterialSummary,
} from '../model/jobCasePresenter'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseSummaryProps {
  jobCase: JobCaseDetailDto
}

export function JobCaseSummary({ jobCase }: JobCaseSummaryProps) {
  const clarificationSummary = getJobCaseClarificationSummary(
    jobCase.informationRequests,
  )
  const materialSummary = getJobCaseMaterialSummary(jobCase)

  return (
    <div className="flex h-full flex-col rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/25 p-3.5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)]">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <SidebarNavIcon name="cases" className="h-[17px] w-[17px]" />
        </div>
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Expediente interno
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
            Revisión de solicitud
          </h2>
          <p className="mt-0.5 text-[8px] text-slate-500">
            Información consolidada para decidir si el trabajo puede pasar a
            cotización.
          </p>
        </div>
      </div>

      <article className="flex flex-1 flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.45)] sm:px-5 sm:py-5">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3.5">
          <div>
            <p className="text-[6px] font-bold uppercase tracking-[0.1em] text-blue-600">
              Solicitud del cliente
            </p>
            <h3 className="mt-1 text-[12px] font-bold tracking-tight text-slate-950">
              {jobCase.request.title}
            </h3>
            <p className="mt-0.5 text-[7px] text-slate-400">
              {jobCase.request.customerName}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[6px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Expediente
            </p>
            <p className="mt-1 text-[9px] font-bold text-slate-950">
              {jobCase.caseNumber}
            </p>
            <p className="mt-0.5 text-[7px] text-slate-400">
              {jobCase.request.requestNumber}
            </p>
          </div>
        </header>

        <div className="mt-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50/55 px-3.5 py-3 sm:grid-cols-[1.3fr_0.85fr_0.85fr]">
          <div>
            <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Solicitada por
            </p>
            <p className="mt-1 text-[9px] font-semibold text-slate-900">
              {jobCase.request.requestedByName ?? 'Sin registrar'}
            </p>
            <p className="mt-0.5 text-[7px] text-slate-400">
              {formatJobCaseDateTime(jobCase.request.submittedAt)}
            </p>
          </div>

          <div>
            <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Referencia
            </p>
            <p className="mt-1 text-[8px] font-semibold text-slate-900">
              {jobCase.request.customerReference ?? 'Sin referencia'}
            </p>
          </div>

          <div>
            <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Fecha requerida
            </p>
            <p className="mt-1 text-[8px] font-semibold text-slate-900">
              {formatJobCaseDate(jobCase.request.requestedDeliveryDate)}
            </p>
          </div>
        </div>

        <section className="mt-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[10px] font-semibold text-slate-950">
              Requerimiento
            </h3>
            <span className="text-[6.5px] font-medium text-slate-400">
              Información original del cliente
            </span>
          </div>

          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/65 px-3.5 py-3">
            <p className="whitespace-pre-wrap text-[8px] leading-4 text-slate-700">
              {jobCase.request.description?.trim() ||
                'El cliente no agregó una descripción adicional a la solicitud.'}
            </p>
          </div>
        </section>

        <section className="mt-5">
          <h3 className="text-[10px] font-semibold text-slate-950">
            Información técnica
          </h3>

          <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="grid gap-2.5 bg-slate-50/70 px-3 py-3 sm:grid-cols-3">
              <div>
                <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Cantidad
                </p>
                <p className="mt-1 text-[9px] font-semibold text-slate-900">
                  {jobCase.request.quantity} pieza
                  {jobCase.request.quantity === 1 ? '' : 's'}
                </p>
              </div>

              <div>
                <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Material solicitado
                </p>
                <p className="mt-1 text-[9px] font-semibold text-slate-900">
                  {jobCase.request.materialRequirement ??
                    'Asesoría técnica requerida'}
                </p>
              </div>

              <div>
                <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Criterio técnico
                </p>
                <p className="mt-1 text-[8px] font-semibold leading-4 text-slate-900">
                  {materialSummary}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[10px] font-semibold text-slate-950">
              Evidencia disponible
            </h3>
            <span className="text-[6.5px] font-medium text-slate-400">
              {jobCase.documents.length} documento
              {jobCase.documents.length === 1 ? '' : 's'} ·{' '}
              {clarificationSummary}
            </span>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Documentación
              </p>
              {jobCase.documents.length > 0 ? (
                <div className="mt-2 space-y-1.5">
                  {jobCase.documents.slice(0, 3).map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <p className="min-w-0 truncate text-[7.5px] font-medium text-slate-700">
                        {document.name}
                      </p>
                      <span className="shrink-0 text-[6.5px] text-slate-400">
                        v{document.currentVersion.version}
                      </span>
                    </div>
                  ))}
                  {jobCase.documents.length > 3 ? (
                    <p className="text-[6.5px] text-slate-400">
                      +{jobCase.documents.length - 3} documentos más
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-[7.5px] text-slate-400">
                  Sin archivos adjuntos.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
              <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Aclaraciones
              </p>
              <p className="mt-2 text-[8px] font-semibold text-slate-900">
                {clarificationSummary}
              </p>
              <p className="mt-1 text-[7px] leading-3.5 text-slate-400">
                Consulta el detalle de preguntas y respuestas antes de cerrar la
                revisión.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-auto border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[6.5px] leading-3.5 text-slate-400">
              Base documental para la preparación de la cotización.
            </p>
            <p className="text-[6.5px] font-medium text-slate-400">
              QualityTrack · {jobCase.caseNumber}
            </p>
          </div>
        </footer>
      </article>
    </div>
  )
}
