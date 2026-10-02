import { formatJobCaseDate, formatJobCaseDateTime } from '../model/jobCasePresenter'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseSummaryProps {
  jobCase: JobCaseDetailDto
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
      <p className="text-[8px] font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-[10px] font-semibold text-slate-950">{value}</p>
    </div>
  )
}

export function JobCaseSummary({ jobCase }: JobCaseSummaryProps) {
  const material =
    jobCase.request.materialRequirementType === 'ASSISTANCE_REQUIRED'
      ? 'Asesoría técnica requerida'
      : jobCase.request.materialRequirement ?? 'Sin especificar'

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.24)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Solicitud original
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
            {jobCase.request.title}
          </h2>
          <p className="mt-1 text-[8px] text-slate-500">
            {jobCase.request.customerName} · solicitada por{' '}
            {jobCase.request.requestedByName ?? 'usuario no disponible'}
          </p>
        </div>

        <span className="inline-flex h-7 shrink-0 items-center rounded-full bg-blue-50 px-3 text-[8px] font-semibold text-blue-700">
          {jobCase.request.requestNumber}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-[8px] font-medium text-slate-500">Descripción</p>
        <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-5 text-slate-700">
          {jobCase.request.description?.trim() ||
            'El cliente no agregó una descripción adicional a la solicitud.'}
        </p>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <Metric
          label="Cantidad"
          value={`${jobCase.request.quantity} pieza${
            jobCase.request.quantity === 1 ? '' : 's'
          }`}
        />
        <Metric label="Material" value={material} />
        <Metric
          label="Fecha requerida"
          value={formatJobCaseDate(jobCase.request.requestedDeliveryDate)}
        />
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-[8px] text-slate-400">Referencia cliente</dt>
          <dd className="mt-0.5 text-[9px] font-medium text-slate-700">
            {jobCase.request.customerReference ?? 'Sin referencia'}
          </dd>
        </div>
        <div>
          <dt className="text-[8px] text-slate-400">Solicitud enviada</dt>
          <dd className="mt-0.5 text-[9px] font-medium text-slate-700">
            {formatJobCaseDateTime(jobCase.request.submittedAt)}
          </dd>
        </div>
      </dl>
    </section>
  )
}
