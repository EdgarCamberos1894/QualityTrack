import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import type {
  DashboardCommercialDto,
  DashboardPipelineDto,
} from '../types/dashboard.types'

interface DashboardPipelineProps {
  pipeline: DashboardPipelineDto
  commercial: DashboardCommercialDto
}

export function DashboardPipeline({
  pipeline,
  commercial,
}: DashboardPipelineProps) {
  const stages = [
    { label: 'Nuevos', value: pipeline.submitted },
    { label: 'En revisión', value: pipeline.underReview },
    { label: 'Esperando cliente', value: pipeline.waitingCustomerInfo },
    { label: 'Listos para cotizar', value: pipeline.readyForQuotation },
    { label: 'En producción', value: pipeline.inProduction },
    { label: 'Completados', value: pipeline.completed },
  ]

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-600">
            Flujo principal
          </p>
          <h2 className="mt-1 text-sm font-semibold text-slate-950">
            Estado de los expedientes
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">
            {commercial.draftQuotations} cotizaciones borrador
          </Badge>
          <Badge tone="info">
            {commercial.sentQuotations} esperando cliente
          </Badge>
        </div>
      </div>

      <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-6">
        {stages.map((stage, index) => (
          <div key={stage.label} className="bg-white px-4 py-5">
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
                {index + 1}
              </span>
              <span className="text-xl font-bold text-slate-950">
                {stage.value}
              </span>
            </div>
            <p className="mt-3 text-[10px] font-semibold text-slate-700">
              {stage.label}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-right">
        <Link
          to="/job-cases"
          className="text-[10px] font-semibold text-blue-600 hover:underline"
        >
          Ver todos los expedientes
        </Link>
      </div>
    </Card>
  )
}
