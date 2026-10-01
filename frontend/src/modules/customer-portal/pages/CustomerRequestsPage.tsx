import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Card } from '@/shared/components/ui/Card'
import { CustomerRequestCard } from '../components/CustomerRequestCard'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import { useCustomerRequests } from '../hooks/useCustomerRequests'
import type { CustomerRequestStatus } from '../types/customerRequest.types'

type Filter = 'ALL' | CustomerRequestStatus

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'UNDER_REVIEW', label: 'Revisión' },
  { value: 'WAITING_CUSTOMER_INFO', label: 'Por responder' },
  { value: 'READY_FOR_QUOTATION', label: 'Cotización' },
  { value: 'IN_PRODUCTION', label: 'Producción' },
  { value: 'COMPLETED', label: 'Completadas' },
]

export function CustomerRequestsPage() {
  const { customer } = useCustomerPortalContext()
  const query = useCustomerRequests(customer.customerId)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('ALL')
  const canCreate = customer.role !== 'VIEWER'

  const visibleRequests = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('es-MX')

    return (query.data ?? []).filter((request) => {
      const matchesFilter =
        filter === 'ALL' || request.jobCase.status === filter
      const matchesSearch =
        !normalized ||
        [
          request.requestNumber,
          request.customerReference,
          request.title,
          request.jobCase.caseNumber,
        ].some((value) =>
          value?.toLocaleLowerCase('es-MX').includes(normalized),
        )

      return matchesFilter && matchesSearch
    })
  }, [filter, query.data, search])

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando solicitudes…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={query.error}
          title="No pudimos cargar tus solicitudes"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Portal de cliente"
        title="Solicitudes"
        description={`Seguimiento de los trabajos solicitados por ${customer.customerName}.`}
        actions={
          canCreate ? (
            <Link
              to={`/portal/${customer.customerId}/requests/new`}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Nueva solicitud
            </Link>
          ) : null
        }
      />

      <Card className="mb-5 p-4">
        <div className="flex flex-col gap-4 @4xl/page:flex-row @4xl/page:items-center @4xl/page:justify-between">
          <label className="block @4xl/page:w-[430px]">
            <span className="sr-only">Buscar solicitudes</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por folio, referencia o proyecto…"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={
                  filter === item.value
                    ? 'rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700'
                    : 'rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100'
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {visibleRequests.length > 0 ? (
        <div className="space-y-4">
          {visibleRequests.map((request) => (
            <CustomerRequestCard
              key={request.id}
              customerId={customer.customerId}
              request={request}
            />
          ))}
        </div>
      ) : (
        <Card className="p-5">
          <EmptyState
            title={
              query.data.length === 0
                ? 'Todavía no hay solicitudes'
                : 'No hay solicitudes que coincidan'
            }
            description={
              query.data.length === 0
                ? canCreate
                  ? 'Crea una solicitud para iniciar un nuevo trabajo con el equipo.'
                  : 'Aún no hay trabajos registrados para esta empresa.'
                : 'Prueba con otro folio, proyecto o filtro.'
            }
          />
        </Card>
      )}
    </PageContainer>
  )
}
