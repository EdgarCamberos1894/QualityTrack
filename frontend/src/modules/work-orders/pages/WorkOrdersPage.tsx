import { useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Card } from '@/shared/components/ui/Card'
import { WorkOrderFilters } from '../components/WorkOrderFilters'
import { WorkOrderTable } from '../components/WorkOrderTable'
import { useWorkOrders } from '../hooks/useWorkOrders'
import { matchesWorkOrderSearch } from '../model/workOrderPresenter'
import type { WorkOrderFiltersValue } from '../types/workOrder.types'

const initialFilters: WorkOrderFiltersValue = {
  search: '',
  status: 'ALL',
  priority: 'ALL',
}

export function WorkOrdersPage() {
  const workOrdersQuery = useWorkOrders()
  const [filters, setFilters] = useState<WorkOrderFiltersValue>(initialFilters)

  const filteredWorkOrders = useMemo(() => {
    const workOrders = workOrdersQuery.data ?? []

    return workOrders.filter(
      (workOrder) =>
        matchesWorkOrderSearch(workOrder, filters.search) &&
        (filters.status === 'ALL' || workOrder.status === filters.status) &&
        (filters.priority === 'ALL' || workOrder.priority === filters.priority),
    )
  }, [filters, workOrdersQuery.data])

  if (workOrdersQuery.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando órdenes de trabajo…" />
      </PageContainer>
    )
  }

  if (workOrdersQuery.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={workOrdersQuery.error}
          title="No pudimos cargar las órdenes de trabajo"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operación"
        title="Órdenes de trabajo"
        description="Consulta el paquete operativo, su planificación y el estado de cada orden vinculada a una cotización aprobada."
      />

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">
              Órdenes registradas
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              {workOrdersQuery.data.length} en total ·{' '}
              {filteredWorkOrders.length} visibles
            </p>
          </div>
        </div>

        <WorkOrderFilters value={filters} onChange={setFilters} />

        {filteredWorkOrders.length > 0 ? (
          <WorkOrderTable workOrders={filteredWorkOrders} />
        ) : (
          <div className="p-5">
            <EmptyState
              title="No hay órdenes que coincidan"
              description="Ajusta los filtros o la búsqueda para consultar otras órdenes de trabajo."
            />
          </div>
        )}
      </Card>
    </PageContainer>
  )
}
