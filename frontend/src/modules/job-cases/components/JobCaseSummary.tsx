import { formatJobCaseDate } from '../model/jobCasePresenter'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseSummaryProps {
  jobCase: JobCaseDetailDto
}

function DataItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-[10px] font-medium text-slate-700">{value}</dd>
    </div>
  )
}

export function JobCaseSummary({ jobCase }: JobCaseSummaryProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
      <div className="grid lg:grid-cols-2">
        <div className="border-b border-slate-100 lg:border-b-0 lg:border-r">
          <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Origen
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Solicitud del cliente
            </h2>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-4 py-3.5">
            <DataItem label="Solicitud" value={jobCase.request.requestNumber} />
            <DataItem label="Cliente" value={jobCase.request.customerName} />
            <DataItem label="Cantidad" value={jobCase.request.quantity} />
            <DataItem
              label="Entrega solicitada"
              value={formatJobCaseDate(jobCase.request.requestedDeliveryDate)}
            />
            <DataItem
              label="Material"
              value={
                jobCase.request.materialRequirement ??
                (jobCase.request.materialRequirementType === 'ASSISTANCE_REQUIRED'
                  ? 'Requiere asistencia'
                  : 'Sin especificar')
              }
            />
            <DataItem
              label="Referencia cliente"
              value={jobCase.request.customerReference ?? 'Sin referencia'}
            />
          </dl>
        </div>

        <div>
          <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Operación
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Gestión interna
            </h2>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-4 py-3.5">
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
            <DataItem label="Documentos" value={jobCase.documents.length} />
            <DataItem
              label="Aclaraciones"
              value={jobCase.informationRequests.length}
            />
            <DataItem
              label="Material técnico"
              value={jobCase.materialSpecification ? 'Definido' : 'Pendiente'}
            />
            {jobCase.closedAt ? (
              <DataItem
                label="Cierre"
                value={formatJobCaseDate(jobCase.closedAt)}
              />
            ) : null}
          </dl>
        </div>
      </div>
    </section>
  )
}
