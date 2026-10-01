import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/ui/Card'
import type { DashboardOverviewDto } from '../types/dashboard.types'

interface DashboardMetricGridProps {
  overview: DashboardOverviewDto
}

export function DashboardMetricGrid({
  overview,
}: DashboardMetricGridProps) {
  const metrics = [
    {
      label: 'Expedientes abiertos',
      value: overview.openCases,
      detail: 'Todo el ciclo aún no terminal',
      href: '/job-cases',
    },
    {
      label: 'Producción activa',
      value: overview.activeProduction,
      detail: 'Liberadas, en proceso o retrabajo',
      href: '/production',
    },
    {
      label: 'Atención de calidad',
      value: overview.qualityAttention,
      detail: 'Pendientes o detenidas por calidad',
      href: '/quality',
    },
    {
      label: 'Listas para entrega',
      value: overview.readyForDelivery,
      detail: 'Aprobadas y esperando logística',
      href: '/deliveries',
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 @4xl/page:grid-cols-4">
      {metrics.map((metric) => (
        <Link key={metric.label} to={metric.href} className="group">
          <Card className="h-full px-5 py-4 transition group-hover:border-blue-200 group-hover:shadow-md">
            <p className="text-[10px] font-medium text-slate-500">
              {metric.label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              {metric.value}
            </p>
            <p className="mt-2 text-[10px] leading-4 text-slate-500">
              {metric.detail}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  )
}
