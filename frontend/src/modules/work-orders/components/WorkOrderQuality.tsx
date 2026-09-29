import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { QualityInspectionDto } from '../types/workOrder.types'

interface WorkOrderQualityProps {
  inspections: QualityInspectionDto[]
}

const statusPresentation = {
  PENDING: { label: 'Pendiente', tone: 'neutral' },
  IN_PROGRESS: { label: 'En inspección', tone: 'info' },
  APPROVED: { label: 'Aprobada', tone: 'success' },
  REJECTED: { label: 'Rechazada', tone: 'danger' },
} as const

export function WorkOrderQuality({ inspections }: WorkOrderQualityProps) {
  if (inspections.length === 0) {
    return (
      <EmptyState
        title="Sin inspecciones"
        description="Todavía no hay inspecciones de calidad registradas para esta orden."
      />
    )
  }

  return (
    <div className="grid gap-3">
      {inspections.map((inspection) => {
        const status = statusPresentation[inspection.status]

        return (
          <article
            key={inspection.id}
            className="rounded-xl border border-[#d9e2ee] bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Inspección #{inspection.id}
                </p>
                <h2 className="mt-1 text-sm font-semibold text-slate-950">
                  {inspection.inspectorName ?? 'Inspector por asignar'}
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  {inspection.measurements.length} mediciones registradas
                </p>
              </div>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
          </article>
        )
      })}
    </div>
  )
}
