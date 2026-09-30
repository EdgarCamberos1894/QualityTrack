import { Card } from '@/shared/components/ui/Card'
import { formatJobCaseDate } from '../model/jobCasePresenter'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseSummaryProps {
  jobCase: JobCaseDetailDto
}

function DataItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-xs font-medium text-slate-800">{value}</dd>
    </div>
  )
}

export function JobCaseSummary({ jobCase }: JobCaseSummaryProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-950">
          Solicitud de origen
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
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
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-950">
          Gestión interna
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
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
      </Card>
    </div>
  )
}
