import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { CaseMaterialSpecificationDto } from '../types/jobCase.types'

interface JobCaseMaterialProps {
  specification: CaseMaterialSpecificationDto | null
}

export function JobCaseMaterial({ specification }: JobCaseMaterialProps) {
  if (!specification) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <EmptyState
          title="Material técnico pendiente"
          description="Todavía no se ha definido una especificación técnica para este expediente."
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
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <p className="text-[8px] font-medium text-slate-400">Material</p>
            <p className="mt-1 text-[12px] font-semibold text-slate-950">
              {specification.materialName}
            </p>
          </div>
          <div>
            <p className="text-[8px] font-medium text-slate-400">Norma o grado</p>
            <p className="mt-1 text-[10px] font-medium text-slate-700">
              {specification.standardOrGrade ?? 'Sin registrar'}
            </p>
          </div>
        </div>

        {specification.technicalNotes ? (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[8px] font-medium text-slate-400">Notas técnicas</p>
            <p className="mt-1 whitespace-pre-wrap text-[10px] leading-4 text-slate-700">
              {specification.technicalNotes}
            </p>
          </div>
        ) : null}

        <p className="mt-3 text-[8px] text-slate-400">
          Definido por {specification.definedByName ?? 'Usuario interno'}
        </p>
      </div>
    </section>
  )
}
