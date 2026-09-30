import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { NonConformityCard } from './NonConformityCard'
import type { WorkOrder360Dto } from '../types/workOrder360.types'

interface NonConformitySectionProps {
  data: WorkOrder360Dto
}

export function NonConformitySection({ data }: NonConformitySectionProps) {
  const nonConformities = [...data.nonConformities].sort((left, right) => {
    if (left.status !== right.status) return left.status === 'OPEN' ? -1 : 1
    return right.id - left.id
  })

  if (nonConformities.length === 0) {
    return (
      <EmptyState
        title="Sin no conformidades"
        description="Las NC aparecen cuando una inspección termina REJECTED."
      />
    )
  }

  return (
    <section className="space-y-3">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wide text-red-700">
          No conformidades y retrabajo
        </p>
        <h2 className="mt-1 text-sm font-semibold text-slate-950">
          Resolución sin perder la historia original
        </h2>
        <p className="mt-1 max-w-3xl text-[10px] leading-5 text-slate-600">
          La inspección rechazada, la ruta de producción y sus ejecuciones se
          preservan. Cada corrección crea su propia revisión REWORK y una nueva
          reinspección.
        </p>
      </div>

      {nonConformities.map((nonConformity) => (
        <NonConformityCard
          key={nonConformity.id}
          nonConformity={nonConformity}
          routingSheets={data.routingSheets}
          executions={data.production.executions}
          workOrderStatus={data.workOrder.status}
        />
      ))}
    </section>
  )
}
