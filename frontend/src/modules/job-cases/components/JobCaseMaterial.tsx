import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { CaseMaterialSpecificationDto } from '../types/jobCase.types'

interface JobCaseMaterialProps {
  specification: CaseMaterialSpecificationDto | null
}

export function JobCaseMaterial({ specification }: JobCaseMaterialProps) {
  if (!specification) {
    return (
      <EmptyState
        title="Material técnico pendiente"
        description="Todavía no se ha definido una especificación técnica para este expediente."
      />
    )
  }

  return (
    <section className="rounded-xl border border-[#d9e2ee] bg-white p-5">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
        Especificación vigente
      </p>
      <h2 className="mt-1 text-lg font-semibold text-slate-950">
        {specification.materialName}
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        {specification.standardOrGrade ?? 'Sin norma o grado indicado'}
      </p>

      {specification.technicalNotes ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {specification.technicalNotes}
        </p>
      ) : null}

      <p className="mt-5 text-[10px] text-slate-500">
        Definido por {specification.definedByName ?? 'Usuario interno'}
      </p>
    </section>
  )
}
