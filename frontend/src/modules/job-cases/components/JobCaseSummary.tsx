import { Badge } from '@/shared/components/ui/Badge'
import {
  formatJobCaseDate,
  formatJobCaseDateTime,
  getJobCaseClarificationSummary,
  getJobCaseStatusPresentation,
} from '../model/jobCasePresenter'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseSummaryProps {
  jobCase: JobCaseDetailDto
}

function DataItem({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div>
      <dt className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-[10px] font-medium leading-4 text-slate-700">
        {value}
      </dd>
    </div>
  )
}

function getMaterialReviewLabel(jobCase: JobCaseDetailDto): string {
  if (jobCase.materialSpecification) {
    const grade = jobCase.materialSpecification.standardOrGrade
    return grade
      ? `${jobCase.materialSpecification.materialName} · ${grade}`
      : jobCase.materialSpecification.materialName
  }

  if (jobCase.request.materialRequirementType === 'ASSISTANCE_REQUIRED') {
    return 'Pendiente de definición técnica'
  }

  return 'No requiere definición adicional'
}

function getReviewMessage(jobCase: JobCaseDetailDto): string | null {
  if (jobCase.status === 'READY_FOR_QUOTATION') {
    return 'La revisión no tiene pendientes bloqueantes y el expediente puede pasar a cotización.'
  }

  if (jobCase.status === 'WAITING_CUSTOMER_INFO') {
    return 'La revisión está detenida hasta recibir la información solicitada al cliente.'
  }

  if (jobCase.status === 'UNDER_REVIEW') {
    return 'Revisa la solicitud, sus archivos y las aclaraciones antes de completar esta etapa.'
  }

  return null
}

export function JobCaseSummary({ jobCase }: JobCaseSummaryProps) {
  const status = getJobCaseStatusPresentation(jobCase.status)
  const clarificationSummary = getJobCaseClarificationSummary(
    jobCase.informationRequests,
  )
  const reviewMessage = getReviewMessage(jobCase)

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Solicitud del cliente
        </p>
        <div className="mt-0.5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-[13px] font-semibold text-slate-950">
              {jobCase.request.title}
            </h2>
            <p className="mt-0.5 text-[8px] text-slate-500">
              {jobCase.request.requestNumber} · {jobCase.request.customerName}
            </p>
          </div>
          <span className="shrink-0 text-[8px] text-slate-400">
            Enviada {formatJobCaseDateTime(jobCase.request.submittedAt)}
          </span>
        </div>
      </div>

      <div className="px-4 py-3.5">
        <div className="rounded-lg border border-slate-100 bg-slate-50/55 px-3.5 py-3">
          <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
            Requerimiento
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-5 text-slate-700">
            {jobCase.request.description?.trim() ||
              'El cliente no agregó una descripción adicional a la solicitud.'}
          </p>
        </div>

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <DataItem label="Cantidad" value={jobCase.request.quantity} />
          <DataItem
            label="Entrega solicitada"
            value={formatJobCaseDate(jobCase.request.requestedDeliveryDate)}
          />
          <DataItem
            label="Referencia cliente"
            value={jobCase.request.customerReference ?? 'Sin referencia'}
          />
          <DataItem
            label="Material solicitado"
            value={
              jobCase.request.materialRequirement ??
              (jobCase.request.materialRequirementType === 'ASSISTANCE_REQUIRED'
                ? 'Requiere asistencia técnica'
                : 'Sin especificar')
            }
          />
          <DataItem
            label="Solicitado por"
            value={jobCase.request.requestedByName ?? 'Sin registrar'}
          />
          <DataItem
            label="Documentación recibida"
            value={`${jobCase.documents.length} archivo${
              jobCase.documents.length === 1 ? '' : 's'
            }`}
          />
        </dl>
      </div>

      <div className="border-t border-slate-200">
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Revisión interna
              </p>
              <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
                Estado para cotización
              </h2>
            </div>
            <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="px-4 py-3.5">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            <DataItem
              label="Responsable"
              value={jobCase.assignedToName ?? 'Sin asignar'}
            />
            <DataItem
              label="Asignado"
              value={formatJobCaseDate(jobCase.assignedAt)}
            />
            <DataItem
              label="Revisión iniciada"
              value={formatJobCaseDate(jobCase.openedAt)}
            />
            <DataItem
              label="Aclaraciones"
              value={clarificationSummary}
            />
            <DataItem
              label="Material técnico"
              value={getMaterialReviewLabel(jobCase)}
            />
            <DataItem
              label="Cierre de revisión"
              value={formatJobCaseDate(jobCase.closedAt)}
            />
          </dl>

          {reviewMessage ? (
            <div
              className={
                jobCase.status === 'READY_FOR_QUOTATION'
                  ? 'mt-4 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3.5 py-2.5'
                  : jobCase.status === 'WAITING_CUSTOMER_INFO'
                    ? 'mt-4 rounded-lg border border-amber-200 bg-amber-50/60 px-3.5 py-2.5'
                    : 'mt-4 rounded-lg border border-blue-100 bg-blue-50/45 px-3.5 py-2.5'
              }
            >
              <p className="text-[9px] leading-4 text-slate-700">
                {reviewMessage}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
