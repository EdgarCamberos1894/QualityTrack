import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { WorkOrderDeliveries } from '../components/WorkOrderDeliveries'
import { WorkOrderDetailHeader } from '../components/WorkOrderDetailHeader'
import { WorkOrderDocuments } from '../components/WorkOrderDocuments'
import { WorkOrderOriginChain } from '../components/WorkOrderOriginChain'
import { WorkOrderPreparation } from '../components/WorkOrderPreparation'
import { WorkOrderProduction } from '../components/WorkOrderProduction'
import { WorkOrderQuality } from '../components/WorkOrderQuality'
import { WorkOrderSummary } from '../components/WorkOrderSummary'
import { WorkOrderTabs } from '../components/WorkOrderTabs'
import { WorkOrderTimeline } from '../components/WorkOrderTimeline'
import { useWorkOrder360 } from '../hooks/useWorkOrder360'
import type { WorkOrderDetailTab } from '../types/workOrder.types'

const validTabs: WorkOrderDetailTab[] = [
  'summary',
  'preparation',
  'production',
  'traceability',
  'documents',
  'quality',
  'delivery',
]

function resolveTab(value: string | null): WorkOrderDetailTab {
  return validTabs.includes(value as WorkOrderDetailTab)
    ? (value as WorkOrderDetailTab)
    : 'summary'
}

export function WorkOrderDetailPage() {
  const { workOrderId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const numericId = Number(workOrderId)
  const validId =
    Number.isInteger(numericId) && numericId > 0 ? numericId : null
  const query = useWorkOrder360(validId)
  const activeTab = resolveTab(searchParams.get('tab'))

  const setActiveTab = (tab: WorkOrderDetailTab) => {
    setSearchParams(tab === 'summary' ? {} : { tab })
  }

  const content = useMemo(() => {
    if (!query.data) return null

    if (activeTab === 'preparation') {
      return <WorkOrderPreparation data={query.data} />
    }

    if (activeTab === 'production') {
      return <WorkOrderProduction data={query.data} />
    }

    if (activeTab === 'traceability') {
      return <WorkOrderTimeline events={query.data.timeline} />
    }

    if (activeTab === 'documents') {
      return <WorkOrderDocuments documents={query.data.documents} />
    }

    if (activeTab === 'quality') {
      return <WorkOrderQuality inspections={query.data.qualityInspections} />
    }

    if (activeTab === 'delivery') {
      return <WorkOrderDeliveries deliveries={query.data.deliveries} />
    }

    return <WorkOrderSummary workOrder={query.data.workOrder} />
  }, [activeTab, query.data])

  if (validId === null) {
    return (
      <PageContainer>
        <ErrorState
          error={new Error('El identificador de la orden no es válido.')}
          title="No pudimos abrir la orden de trabajo"
        />
      </PageContainer>
    )
  }

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando expediente 360…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={query.error}
          title="No pudimos cargar el expediente 360"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <WorkOrderDetailHeader workOrder={query.data.workOrder} />

      <div className="space-y-4">
        <WorkOrderOriginChain
          workOrder={query.data.workOrder}
          eventCount={query.data.timeline.length}
        />

        <WorkOrderTabs
          activeTab={activeTab}
          counts={{
            documents: query.data.documents.length,
            quality: query.data.qualityInspections.length,
            delivery: query.data.deliveries.length,
          }}
          onChange={setActiveTab}
        />

        {content}
      </div>
    </PageContainer>
  )
}
