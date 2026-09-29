import { useMemo, useState } from 'react'
import { useCustomerPortalContext } from '@/modules/customer-portal'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Card } from '@/shared/components/ui/Card'
import { CustomerQuotationTable } from '../components/CustomerQuotationTable'
import { useCustomerQuotations } from '../hooks/useCustomerQuotations'

export function CustomerQuotationsPage() {
  const { customer } = useCustomerPortalContext()
  const query = useCustomerQuotations(customer.customerId)
  const [search, setSearch] = useState('')

  const visibleQuotations = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('es-MX')

    if (!normalized) return query.data ?? []

    return (query.data ?? []).filter((quotation) =>
      [
        quotation.quotationNumber,
        quotation.caseNumber,
        quotation.requestNumber,
      ].some((value) => value.toLocaleLowerCase('es-MX').includes(normalized)),
    )
  }, [query.data, search])

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
          title="No pudimos cargar tus cotizaciones"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Portal de cliente"
        title="Cotizaciones"
        description="Consulta la revisión vigente de cada propuesta enviada a tu empresa y responde cuando sea necesario."
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">
              Propuestas recibidas
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              {query.data.length} cotizaciones · {visibleQuotations.length}{' '}
              visibles
            </p>
          </div>
          <label className="block sm:w-80">
            <span className="sr-only">Buscar cotizaciones</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por cotización, solicitud o expediente"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>

        {visibleQuotations.length > 0 ? (
          <CustomerQuotationTable
            customerId={customer.customerId}
            quotations={visibleQuotations}
          />
        ) : (
          <div className="p-5">
            <EmptyState
              title="No hay cotizaciones que coincidan"
              description="Prueba con otro número de cotización, solicitud o expediente."
            />
          </div>
        )}
      </Card>
    </PageContainer>
  )
}
