import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { formatJobCaseDateTime } from '../model/jobCasePresenter'
import type {
  CaseMaterialSpecificationDto,
  JobCaseRequestSummaryDto,
} from '../types/jobCase.types'

interface JobCaseMaterialProps {
  specification: CaseMaterialSpecificationDto | null
  request: JobCaseRequestSummaryDto
}

export function JobCaseMaterial({
  specification,
  request,
}: JobCaseMaterialProps) {
  if (!specification) {
    if (request.materialRequirementType === 'SPECIFIED') {
      return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
          <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Material de la solicitud
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Especificado por el cliente
            </h2>
          </div>

          <div className="px-4 py-3.5">
            <p className="text-[8px] font-medium text-slate-400">
              Material solicitado
            </p>
            <p className="mt-1 text-[12px] font-semibold text-slate-950">
              {request.materialRequirement ?? 'Sin detalle registrado'}
            </p>
            <p className="mt-2 max-w-2xl text-[9px] leading-4 text-slate-500">
              La solicitud ya incluye una especificación de material. No se
              requiere una definición técnica adicional para completar la
              revisión, salvo que el equipo determine lo contrario.
            </p>
          </div>
        </section>
      )
    }

    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <EmptyState
          title="Definición técnica pendiente"
          description="El cliente solicitó asistencia para definir el material. Esta definición es necesaria antes de completar la revisión."
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Especificación vigente
        </p>
        <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
          Material técnico
        </h2>
      </div>

      <div className="px-4 py-3.5">
        {request.materialRequirement ? (
          <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <p className="text-[8px] font-medium text-slate-400">
              Referencia de la solicitud
            </p>
            <p className="mt-1 text-[9px] font-medium text-slate-700">
              {request.materialRequirement}
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <p className="text-[8px] font-medium text-slate-400">Material</p>
            <p className="mt-1 text-[12px] font-semibold text-slate-950">
              {specification.materialName}
            </p>
          </div>
          <div>
            <p className="text-[8px] font-medium text-slate-400">
              Norma o grado
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-700">
              {specification.standardOrGrade ?? 'Sin registrar'}
            </p>
          </div>
        </div>

        {specification.technicalNotes ? (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[8px] font-medium text-slate-400">
              Notas técnicas
            </p>
            <p className="mt-1 whitespace-pre-wrap text-[10px] leading-4 text-slate-700">
              {specification.technicalNotes}
            </p>
          </div>
        ) : null}

        <p className="mt-3 text-[8px] text-slate-400">
          Definido por {specification.definedByName ?? 'Usuario interno'} ·{' '}
          {formatJobCaseDateTime(specification.definedAt)}
        </p>
      </div>
    </section>
  )
}
