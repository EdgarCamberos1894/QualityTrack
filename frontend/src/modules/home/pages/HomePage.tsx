import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { DashboardAttention } from '../components/DashboardAttention'
import { DashboardMetricGrid } from '../components/DashboardMetricGrid'
import { DashboardPipeline } from '../components/DashboardPipeline'
import { DashboardRecentActivity } from '../components/DashboardRecentActivity'
import { useInternalDashboard } from '../hooks/useInternalDashboard'

export function HomePage() {
  const query = useInternalDashboard()

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando panel operacional…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={query.error}
          title="No pudimos cargar el panel operacional"
        />
      </PageContainer>
    )
  }

  const dashboard = query.data

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operación interna"
        title="Panel de operación"
        description="Una lectura rápida del flujo comercial, productivo, de calidad y logística. Los datos se actualizan automáticamente cada minuto."
      />

      <DashboardMetricGrid overview={dashboard.overview} />

      <div className="mt-5">
        <DashboardPipeline
          pipeline={dashboard.pipeline}
          commercial={dashboard.commercial}
        />
      </div>

      <div className="mt-5 grid gap-5 @4xl/page:grid-cols-[0.9fr_1.1fr]">
        <DashboardAttention items={dashboard.attention} />
        <DashboardRecentActivity activity={dashboard.recentActivity} />
      </div>
    </PageContainer>
  )
}
