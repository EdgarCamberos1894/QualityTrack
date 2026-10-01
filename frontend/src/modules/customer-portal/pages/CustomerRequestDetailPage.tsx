import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { CancelCustomerRequestDialog } from '../components/CancelCustomerRequestDialog'
import { CustomerDeliveryTracking } from '../components/CustomerDeliveryTracking'
import { CustomerRequestDocuments } from '../components/CustomerRequestDocuments'
import { CustomerRequestFlowSteps } from '../components/CustomerRequestFlowSteps'
import { RespondInformationDialog } from '../components/RespondInformationDialog'
import { useCustomerRequestDeliveries } from '../hooks/useCustomerDeliveries'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import { useCustomerRequestActions } from '../hooks/useCustomerRequestMutations'
import { useCustomerRequestDetail } from '../hooks/useCustomerRequests'
import {
  canCancelCustomerRequest,
  canModifyCustomerRequestDocuments,
  formatCustomerRequestDate,
  formatCustomerRequestDateTime,
  getCustomerRequestStatusPresentation,
} from '../model/customerRequestPresenter'
import type {
  CancelCustomerRequestFormValues,
  RespondInformationFormValues,
} from '../schemas/customerRequest.schemas'
import { getCustomerDeliverySummary } from '../model/customerDeliveryPresenter'
import type { CustomerInformationRequestDto } from '../types/customerRequest.types'

export function CustomerRequestDetailPage() {
  const { requestId } = useParams()
  const { customer } = useCustomerPortalContext()
  const numericId = Number(requestId)
  const validId =
    Number.isInteger(numericId) && numericId > 0 ? numericId : null
  const query = useCustomerRequestDetail(customer.customerId, validId)
  const deliveriesQuery = useCustomerRequestDeliveries(
    customer.customerId,
    validId,
  )
  const actions = useCustomerRequestActions(customer.customerId, validId ?? 0)
  const [respondingTo, setRespondingTo] =
    useState<CustomerInformationRequestDto | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)

  if (validId === null) {
    return (
      <PageContainer>
        <ErrorState
          error={new Error('El identificador de la solicitud no es válido.')}
          title="Solicitud no disponible"
        />
      </PageContainer>
    )
  }

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando solicitud…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={query.error}
          title="No pudimos cargar la solicitud"
        />
      </PageContainer>
    )
  }

  const request = query.data
  const deliverySummary = getCustomerDeliverySummary(
    deliveriesQuery.data ?? [],
    request.quantity,
  )
  const deliveryProgress =
    request.jobCase.status === 'COMPLETED'
      ? 'DELIVERED'
      : deliverySummary.completedAgainstRequestedQuantity
        ? 'DELIVERED'
        : deliverySummary.hasInTransit
          ? 'IN_TRANSIT'
          : deliverySummary.deliveredQuantity > 0
            ? 'PARTIAL'
            : undefined
  const requestStatus = getCustomerRequestStatusPresentation(
    request.jobCase.status,
  )
  const status =
    request.jobCase.status === 'COMPLETED'
      ? requestStatus
      : deliverySummary.hasInTransit
        ? { label: 'En camino', tone: 'info' as const }
        : deliverySummary.completedAgainstRequestedQuantity
          ? { label: 'Entregada', tone: 'success' as const }
          : requestStatus
  const canWrite = customer.role !== 'VIEWER'
  const canCancel = canWrite && canCancelCustomerRequest(request)
  const canModifyDocuments =
    canWrite && canModifyCustomerRequestDocuments(request)
  const openInformationRequest =
    request.informationRequests.find((item) => item.open) ?? null
  const latestResponse =
    [...request.informationRequests]
      .filter((item) => item.respondedAt !== null)
      .sort(
        (left, right) =>
          new Date(left.respondedAt ?? 0).getTime() -
          new Date(right.respondedAt ?? 0).getTime(),
      )
      .at(-1) ?? null

  const resetMutationErrors = () => {
    actions.respond.reset()
    actions.cancel.reset()
    actions.addDocument.reset()
    actions.addVersion.reset()
    actions.removeDocument.reset()
  }

  const respond = async (values: RespondInformationFormValues) => {
    if (!respondingTo) return false

    try {
      await actions.respond.mutateAsync({
        informationRequestId: respondingTo.id,
        payload: { response: values.response.trim() },
      })
      setRespondingTo(null)
      return true
    } catch {
      return false
    }
  }

  const cancel = async (values: CancelCustomerRequestFormValues) => {
    try {
      await actions.cancel.mutateAsync({
        ...(values.reason.trim() ? { reason: values.reason.trim() } : {}),
      })
      setCancelOpen(false)
      return true
    } catch {
      return false
    }
  }

  return (
    <PageContainer>
      <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/55 shadow-[0_12px_34px_-30px_rgba(15,23,42,0.35)]">
        <div className="px-5 py-4 lg:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/60">
                <SidebarNavIcon name="requests" className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                  Detalle de solicitud
                </p>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                  <h1 className="text-xl font-bold tracking-tight text-slate-950">
                    {request.requestNumber}
                  </h1>
                  <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
                    {status.label}
                  </Badge>
                </div>
                <p className="mt-1 max-w-3xl truncate text-[12px] font-medium text-slate-700">
                  {request.title}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                to={`/portal/${customer.customerId}/requests`}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-medium text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Volver a solicitudes
              </Link>

              {canCancel ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="!h-7 !px-2.5 !text-[8px] !font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    resetMutationErrors()
                    setCancelOpen(true)
                  }}
                >
                  Cancelar solicitud
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <CustomerRequestFlowSteps
        status={request.jobCase.status}
        deliveryProgress={deliveryProgress}
      />

      {openInformationRequest ? (
        <section className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            Acción requerida
          </p>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-950">
            {openInformationRequest.question}
          </p>
          <p className="mt-2 text-[10px] text-slate-500">
            Solicitado por{' '}
            {openInformationRequest.requestedByName ?? 'el equipo'} ·{' '}
            {formatCustomerRequestDateTime(openInformationRequest.requestedAt)}
          </p>
          {canWrite ? (
            <Button
              className="mt-4"
              onClick={() => {
                resetMutationErrors()
                setRespondingTo(openInformationRequest)
              }}
            >
              Responder
            </Button>
          ) : (
            <p className="mt-4 text-xs text-amber-800">
              Tu rol es de consulta. Un administrador o solicitante debe
              responder.
            </p>
          )}
        </section>
      ) : latestResponse ? (
        <section className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
            ✓ Respuesta enviada
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            La revisión puede continuar.
          </p>
          <p className="mt-1 text-[10px] text-slate-600">
            Tu respuesta quedó registrada el{' '}
            {formatCustomerRequestDateTime(latestResponse.respondedAt ?? '')}.
          </p>
        </section>
      ) : null}

      {request.jobCase.status === 'COMPLETED' ? (
        <section className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold text-emerald-800">
            Trabajo completado
          </p>
          <p className="mt-1 text-[10px] text-emerald-700">
            La cantidad solicitada fue entregada y el expediente quedó cerrado
            {request.jobCase.closedAt
              ? ` el ${formatCustomerRequestDateTime(request.jobCase.closedAt)}`
              : ''}
            .
          </p>
        </section>
      ) : null}

      {request.jobCase.status === 'CANCELLED' ? (
        <section className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold text-red-800">
            Solicitud cancelada
          </p>
          {request.jobCase.cancellationReason ? (
            <p className="mt-1 text-[10px] text-red-700">
              Motivo: {request.jobCase.cancellationReason}
            </p>
          ) : null}
        </section>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <Card className="p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.3)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SidebarNavIcon name="requests" className="h-[17px] w-[17px]" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Información del trabajo
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
                Resumen de la solicitud
              </h2>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-[8px] font-medium text-slate-500">Cantidad</p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-950">
                {request.quantity} pieza{request.quantity === 1 ? '' : 's'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-[8px] font-medium text-slate-500">Material</p>
              <p className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-4 text-slate-950">
                {request.materialRequirementType === 'ASSISTANCE_REQUIRED'
                  ? 'Asesoría técnica'
                  : request.materialRequirement}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-[8px] font-medium text-slate-500">
                Fecha requerida
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-950">
                {formatCustomerRequestDate(request.requestedDeliveryDate)}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-100 bg-white px-3.5 py-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Descripción
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-5 text-slate-700">
              {request.description}
            </p>
          </div>

          {request.materialRequirementType === 'ASSISTANCE_REQUIRED' ? (
            <div className="mt-2.5 rounded-xl border border-blue-100 bg-blue-50/55 px-3.5 py-3">
              <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-blue-600">
                Contexto para asesoría
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-5 text-slate-700">
                {request.materialRequirement}
              </p>
            </div>
          ) : null}
        </Card>

        <Card className="p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.26)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <SidebarNavIcon name="cases" className="h-[17px] w-[17px]" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Contexto del expediente
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
                Seguimiento
              </h2>
            </div>
          </div>

          <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
              <dt className="text-[8px] font-medium text-slate-500">
                Expediente
              </dt>
              <dd className="mt-0.5 text-[10px] font-semibold text-slate-950">
                {request.jobCase.caseNumber}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
              <dt className="text-[8px] font-medium text-slate-500">
                Etapa visible
              </dt>
              <dd className="mt-0.5 text-[10px] font-semibold text-slate-950">
                {request.jobCase.status === 'COMPLETED'
                  ? 'Finalizada'
                  : deliveryProgress
                    ? 'Entrega'
                    : requestStatus.stage}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
              <dt className="text-[8px] font-medium text-slate-500">
                Solicitada por
              </dt>
              <dd className="mt-0.5 truncate text-[10px] font-semibold text-slate-950">
                {request.requestedByName}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5">
              <dt className="text-[8px] font-medium text-slate-500">
                Referencia cliente
              </dt>
              <dd className="mt-0.5 truncate text-[10px] font-semibold text-slate-950">
                {request.customerReference ?? 'Sin referencia'}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="mt-5">
        <CustomerDeliveryTracking
          customerId={customer.customerId}
          requestId={request.id}
          deliveries={deliveriesQuery.data}
          requestedQuantity={request.quantity}
          pending={deliveriesQuery.isPending}
          error={deliveriesQuery.error}
        />
      </div>

      <div className="mt-5">
        <CustomerRequestDocuments
          customerId={customer.customerId}
          requestId={request.id}
          documents={request.documents}
          canModify={canModifyDocuments}
          adding={actions.addDocument.isPending}
          addingVersion={actions.addVersion.isPending}
          removing={actions.removeDocument.isPending}
          mutationError={
            actions.addDocument.error ??
            actions.addVersion.error ??
            actions.removeDocument.error
          }
          onResetErrors={resetMutationErrors}
          onAddDocument={async (input) => {
            try {
              await actions.addDocument.mutateAsync(input)
              return true
            } catch {
              return false
            }
          }}
          onAddVersion={async (documentId, file) => {
            if (file.size > 25 * 1024 * 1024) return false
            try {
              await actions.addVersion.mutateAsync({ documentId, file })
              return true
            } catch {
              return false
            }
          }}
          onRemove={async (documentId) => {
            try {
              await actions.removeDocument.mutateAsync(documentId)
              return true
            } catch {
              return false
            }
          }}
        />
      </div>

      {request.informationRequests.length > 0 ? (
        <Card className="mt-5 p-5">
          <h2 className="text-sm font-semibold text-slate-950">
            Preguntas y respuestas
          </h2>
          <div className="mt-4 space-y-3">
            {request.informationRequests.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold text-slate-900">
                  {item.question}
                </p>
                <p className="mt-1 text-[9px] text-slate-500">
                  {formatCustomerRequestDateTime(item.requestedAt)}
                </p>
                {item.response ? (
                  <p className="mt-3 border-l-2 border-emerald-300 pl-3 text-xs leading-5 text-slate-700">
                    {item.response}
                  </p>
                ) : (
                  <p className="mt-3 text-[10px] font-semibold text-amber-700">
                    Pendiente de respuesta
                  </p>
                )}
              </article>
            ))}
          </div>
        </Card>
      ) : null}

      <RespondInformationDialog
        request={respondingTo}
        submitting={actions.respond.isPending}
        error={actions.respond.error}
        onClose={() => setRespondingTo(null)}
        onSubmit={respond}
      />

      <CancelCustomerRequestDialog
        open={cancelOpen}
        submitting={actions.cancel.isPending}
        error={actions.cancel.error}
        onClose={() => setCancelOpen(false)}
        onSubmit={cancel}
      />
    </PageContainer>
  )
}
