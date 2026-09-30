import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { Button } from '@/shared/components/ui/Button'
import { CancelWorkOrderDialog } from '../components/CancelWorkOrderDialog'
import { WorkOrderDeliveries } from '../components/WorkOrderDeliveries'
import { WorkOrderDetailHeader } from '../components/WorkOrderDetailHeader'
import { WorkOrderDocuments } from '../components/WorkOrderDocuments'
import { WorkOrderPreparation } from '../components/WorkOrderPreparation'
import { WorkOrderProduction } from '../components/WorkOrderProduction'
import { WorkOrderQuality } from '../components/WorkOrderQuality'
import { WorkOrderSummary } from '../components/WorkOrderSummary'
import { WorkOrderTabs } from '../components/WorkOrderTabs'
import { WorkOrderTimeline } from '../components/WorkOrderTimeline'
import { useCancelWorkOrder } from '../hooks/useCancelWorkOrder'
import { useWorkOrder360 } from '../hooks/useWorkOrder360'
import type { CancelWorkOrderFormValues } from '../schemas/workOrderCancellation.schema'
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
  const session = useSessionStore((state) => state.session)
  const [cancelOpen, setCancelOpen] = useState(false)
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const numericId = Number(workOrderId)
  const validId =
    Number.isInteger(numericId) && numericId > 0 ? numericId : null
  const query = useWorkOrder360(validId)
  const cancelMutation = useCancelWorkOrder(validId ?? 0)
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
      return <WorkOrderTimeline data={query.data} />
    }

    if (activeTab === 'documents') {
      return <WorkOrderDocuments documents={query.data.documents} />
    }

    if (activeTab === 'quality') {
      return <WorkOrderQuality data={query.data} />
    }

    if (activeTab === 'delivery') {
      return <WorkOrderDeliveries data={query.data} />
    }

    return <WorkOrderSummary data={query.data} />
  }, [activeTab, query.data])

  useEffect(() => {
    if (!query.data || !location.hash) return

    const frame = window.requestAnimationFrame(() => {
      const targetId = decodeURIComponent(location.hash.slice(1))
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeTab, location.hash, query.data])

  const cancel = async (values: CancelWorkOrderFormValues) => {
    try {
      await cancelMutation.mutateAsync({
        reason: values.reason.trim() || undefined,
      })
      return true
    } catch {
      return false
    }
  }

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

  const roles = session?.user.roles ?? []
  const canCancel =
    query.data.workOrder.status === 'CREATED' &&
    (roles.includes('ADMIN') || roles.includes('PRODUCTION'))

  return (
    <PageContainer>
      <WorkOrderDetailHeader workOrder={query.data.workOrder} />

      <div className="space-y-4">
        {query.data.workOrder.status === 'CANCELLED' ? (
          <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
            <p className="text-xs font-semibold text-red-900">
              Orden de trabajo cancelada
            </p>
            <p className="mt-1 text-[10px] leading-5 text-red-800">
              {query.data.workOrder.cancellationReason?.trim()
                ? query.data.workOrder.cancellationReason
                : 'No se registró un motivo de cancelación.'}
            </p>
          </section>
        ) : canCancel ? (
          <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Cancelar orden en preparación
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                También se cancelará el expediente asociado. La acción deja de
                estar disponible cuando la orden es liberada a producción.
              </p>
            </div>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                cancelMutation.reset()
                setCancelOpen(true)
              }}
            >
              Cancelar orden
            </Button>
          </section>
        ) : null}

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

      <CancelWorkOrderDialog
        workOrder={cancelOpen ? query.data.workOrder : null}
        submitting={cancelMutation.isPending}
        error={cancelMutation.error}
        onClose={() => {
          cancelMutation.reset()
          setCancelOpen(false)
        }}
        onSubmit={cancel}
      />
    </PageContainer>
  )
}
