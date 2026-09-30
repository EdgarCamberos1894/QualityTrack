import { useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Card } from '@/shared/components/ui/Card'
import { InternalCustomerFilters } from '../components/InternalCustomerFilters'
import { InternalCustomersTable } from '../components/InternalCustomersTable'
import { useInternalCustomers } from '../hooks/useInternalCustomers'
import { matchesInternalCustomerSearch } from '../model/internalCustomerPresenter'
import type { InternalCustomerFiltersValue } from '../types/internalCustomer.types'

const initialFilters: InternalCustomerFiltersValue = {
  search: '',
  status: 'ALL',
}

export function InternalCustomersPage() {
  const query = useInternalCustomers()
  const [filters, setFilters] = useState<InternalCustomerFiltersValue>(
    initialFilters,
  )

  const visibleCustomers = useMemo(() => {
    const customers = query.data ?? []

    return customers.filter(
      (customer) =>
        matchesInternalCustomerSearch(customer, filters.search) &&
        (filters.status === 'ALL' || customer.status === filters.status),
    )
  }, [filters, query.data])

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando clientes…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={query.error}
          title="No pudimos cargar los clientes"
        />
      </PageContainer>
    )
  }

  const customers = query.data
  const active = customers.filter((customer) => customer.status === 'ACTIVE').length
  const openCases = customers.reduce(
    (total, customer) => total + customer.openCases,
    0,
  )
  const completedCases = customers.reduce(
    (total, customer) => total + customer.completedCases,
    0,
  )

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Relación comercial"
        title="Clientes"
        description="Consulta las empresas registradas y su contexto operativo sin entrar al portal del cliente."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Empresas</p>
          <p className="mt-1 text-xl font-bold text-slate-950">
            {customers.length}
          </p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Activas</p>
          <p className="mt-1 text-xl font-bold text-slate-950">{active}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Expedientes abiertos</p>
          <p className="mt-1 text-xl font-bold text-amber-700">{openCases}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Completados</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">
            {completedCases}
          </p>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-950">
            Directorio de empresas
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">
            {customers.length} registradas · {visibleCustomers.length} visibles
          </p>
        </div>

        <InternalCustomerFilters value={filters} onChange={setFilters} />

        {visibleCustomers.length > 0 ? (
          <InternalCustomersTable customers={visibleCustomers} />
        ) : (
          <div className="p-5">
            <EmptyState
              title="No hay clientes que coincidan"
              description="Ajusta la búsqueda o el filtro de estado."
            />
          </div>
        )}
      </Card>
    </PageContainer>
  )
}
