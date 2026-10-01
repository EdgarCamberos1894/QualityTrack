import { useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
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
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando órdenes de trabajo…" />
      </PageContainer>
    )
  }

  if (workOrdersQuery.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={workOrdersQuery.error}
          title="No pudimos cargar las órdenes de trabajo"
        />
      </PageContainer>
    )
  }

  const workOrders = workOrdersQuery.data
  const preparing = workOrders.filter(
    (workOrder) => workOrder.status === 'CREATED',
  ).length
  const activeOperation = workOrders.filter((workOrder) =>
    [
      'READY_FOR_PRODUCTION',
      'IN_PRODUCTION',
      'QUALITY_PENDING',
      'QUALITY_HOLD',
      'REWORK_IN_PROGRESS',
    ].includes(workOrder.status),
  ).length
  const readyForDelivery = workOrders.filter(
    (workOrder) => workOrder.status === 'READY_FOR_DELIVERY',
  ).length
  const hasFilters =
    filters.search.length > 0 ||
    filters.status !== 'ALL' ||
    filters.priority !== 'ALL'

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="work-orders" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Operación
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Órdenes de trabajo
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                Sigue cada paquete operativo desde su preparación hasta calidad,
                entrega y cierre dentro del Expediente 360.
              </p>
            </div>
          </div>

          <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
            <div className="py-1 sm:pr-4">
              <p className="text-[8px] font-medium text-slate-400">Órdenes</p>
              <p className="mt-0.5 text-[16px] font-bold text-slate-950">
                {workOrders.length}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                En preparación
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-slate-950">
                {preparing}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                En operación
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-blue-700">
                {activeOperation}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:pl-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                Listas para entrega
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-emerald-700">
                {readyForDelivery}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
        <div className="flex flex-col gap-2 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Bandeja operativa
            </p>
            <h2 className="mt-0.5 text-[13px] font-semibold text-slate-950">
              Órdenes registradas
            </h2>
          </div>
          <p className="text-[8px] font-medium text-slate-400">
            {filteredWorkOrders.length} de {workOrders.length} visibles
          </p>
        </div>

        <WorkOrderFilters value={filters} onChange={setFilters} />

        {hasFilters ? (
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-2 sm:px-5">
            <p className="text-[8px] text-slate-400">
              Filtros aplicados a la bandeja
            </p>
            <button
              type="button"
              onClick={() => setFilters(initialFilters)}
              className="text-[8px] font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Limpiar filtros
            </button>
          </div>
        ) : null}

        {filteredWorkOrders.length > 0 ? (
          <WorkOrderTable workOrders={filteredWorkOrders} />
        ) : (
          <div className="bg-slate-50/35 p-4">
            <Card className="p-4 shadow-none">
              <EmptyState
                title="No hay órdenes que coincidan"
                description="Ajusta los filtros o la búsqueda para consultar otras órdenes de trabajo."
              />
            </Card>
          </div>
        )}
      </section>
    </PageContainer>
  )
}
