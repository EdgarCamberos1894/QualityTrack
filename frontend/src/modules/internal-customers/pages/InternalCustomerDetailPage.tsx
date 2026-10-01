import { Link, useParams } from 'react-router-dom'
import { JobCaseTable } from '@/modules/job-cases'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import { InternalCustomerMembers } from '../components/InternalCustomerMembers'
import { useInternalCustomer } from '../hooks/useInternalCustomers'
import {
  formatInternalCustomerDate,
  getInternalCustomerLocation,
  getInternalCustomerStatusPresentation,
} from '../model/internalCustomerPresenter'

function parseCustomerId(value: string | undefined): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function InternalCustomerDetailPage() {
  const { customerId } = useParams()
  const validId = parseCustomerId(customerId)
  const query = useInternalCustomer(validId)

  if (validId === null) {
    return (
      <PageContainer>
        <ErrorState
          error={new Error('El identificador del cliente no es válido.')}
          title="Cliente no válido"
        />
      </PageContainer>
    )
  }

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando cliente…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState error={query.error} title="No pudimos cargar el cliente" />
      </PageContainer>
    )
  }

  const { customer, members, jobCases } = query.data
  const status = getInternalCustomerStatusPresentation(customer.status)

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Cliente"
        title={customer.name}
        description="Contexto comercial y operativo de la empresa dentro de QualityTrack."
        actions={
          <Link
            to="/customers"
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Volver a clientes
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 @4xl/page:grid-cols-4">
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Estado</p>
          <div className="mt-2">
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Miembros activos</p>
          <p className="mt-1 text-xl font-bold text-slate-950">
            {customer.activeMembers}
          </p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Expedientes abiertos</p>
          <p className="mt-1 text-xl font-bold text-amber-700">
            {customer.openCases}
          </p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Completados</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">
            {customer.completedCases}
          </p>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 @4xl/page:grid-cols-[minmax(0,1fr)_minmax(360px,0.7fr)]">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-950">
            Datos de empresa
          </h2>
          <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                RFC
              </dt>
              <dd className="mt-1 text-xs text-slate-800">
                {customer.rfc || 'Sin registrar'}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Ubicación
              </dt>
              <dd className="mt-1 text-xs text-slate-800">
                {getInternalCustomerLocation(customer)}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Correo administrativo
              </dt>
              <dd className="mt-1 break-all text-xs text-slate-800">
                {customer.administrativeEmail || 'Sin registrar'}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Teléfono
              </dt>
              <dd className="mt-1 text-xs text-slate-800">
                {customer.phone || 'Sin registrar'}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Sitio web
              </dt>
              <dd className="mt-1 break-all text-xs text-slate-800">
                {customer.website || 'Sin registrar'}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Registrada
              </dt>
              <dd className="mt-1 text-xs text-slate-800">
                {formatInternalCustomerDate(customer.createdAt)}
              </dd>
            </div>
          </dl>
        </Card>

        <InternalCustomerMembers members={members} />
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-950">
            Expedientes de la empresa
          </h2>
          <p className="mt-1 text-[10px] text-slate-500">
            {jobCases.length} expedientes en total · {customer.cancelledCases}{' '}
            cancelados
          </p>
        </div>

        {jobCases.length > 0 ? (
          <JobCaseTable jobCases={jobCases} />
        ) : (
          <div className="p-5">
            <EmptyState
              title="Sin expedientes"
              description="Esta empresa todavía no tiene solicitudes convertidas en expediente."
            />
          </div>
        )}
      </Card>
    </PageContainer>
  )
}
