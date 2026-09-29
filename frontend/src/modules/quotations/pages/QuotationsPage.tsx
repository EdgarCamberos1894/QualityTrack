import { useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Card } from '@/shared/components/ui/Card'
import { QuotationFilters } from '../components/QuotationFilters'
import { QuotationTable } from '../components/QuotationTable'
import { useQuotations } from '../hooks/useQuotations'
import { matchesQuotationSearch } from '../model/quotationPresenter'
import type { QuotationFiltersValue } from '../types/quotation.types'

const initialFilters: QuotationFiltersValue = {
  search: '',
  status: 'ALL',
}

export function QuotationsPage() {
  const query = useQuotations()
  const [filters, setFilters] = useState<QuotationFiltersValue>(initialFilters)

  const visibleQuotations = useMemo(() => {
    const quotations = query.data ?? []

    return quotations.filter(
      (quotation) =>
        matchesQuotationSearch(quotation, filters.search) &&
        (filters.status === 'ALL' || quotation.status === filters.status),
    )
  }, [filters, query.data])

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando cotizaciones…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={query.error}
          title="No pudimos cargar las cotizaciones"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Comercial"
        title="Cotizaciones"
        description="Consulta la revisión vigente de cada flujo comercial y su estado frente al cliente."
      />

      <Card className="overflow-hidden">
        <div className="px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-950">
            Bandeja comercial
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">
            {query.data.length} flujos · {visibleQuotations.length} visibles
          </p>
        </div>

        <QuotationFilters value={filters} onChange={setFilters} />

        {visibleQuotations.length > 0 ? (
          <QuotationTable quotations={visibleQuotations} />
        ) : (
          <div className="p-5">
            <EmptyState
              title="No hay cotizaciones que coincidan"
              description="Ajusta la búsqueda o el estado para consultar otros flujos."
            />
          </div>
        )}
      </Card>
    </PageContainer>
  )
}
