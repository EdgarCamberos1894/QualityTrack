import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { CancelCustomerRequestDialog } from '../components/CancelCustomerRequestDialog'
import { CustomerRequestDocuments } from '../components/CustomerRequestDocuments'
import { CustomerRequestFlowSteps } from '../components/CustomerRequestFlowSteps'
import { RespondInformationDialog } from '../components/RespondInformationDialog'
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
import type { CustomerInformationRequestDto } from '../types/customerRequest.types'

export function CustomerRequestDetailPage() {
  const { requestId } = useParams()
  const { customer } = useCustomerPortalContext()
  const numericId = Number(requestId)
  const validId =
    Number.isInteger(numericId) && numericId > 0 ? numericId : null
  const query = useCustomerRequestDetail(customer.customerId, validId)
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
  const status = getCustomerRequestStatusPresentation(request.jobCase.status)
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
      <div className="mb-6">
        <Link
          to={`/portal/${customer.customerId}/requests`}
          className="text-[10px] font-medium text-slate-500 hover:text-blue-700"
        >
          Solicitudes / {request.requestNumber}
        </Link>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              {request.requestNumber}
            </h1>
            <p className="mt-1 text-base font-medium text-slate-700">
              {request.title}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            {canCancel ? (
              <Button
                size="sm"
                variant="ghost"
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

      <CustomerRequestFlowSteps status={request.jobCase.status} />

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

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,690px)_minmax(300px,1fr)]">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-950">
            Resumen de la solicitud
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[9px] text-slate-500">Cantidad</p>
              <p className="mt-1 text-xs font-semibold text-slate-950">
                {request.quantity} pieza{request.quantity === 1 ? '' : 's'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[9px] text-slate-500">Material</p>
              <p className="mt-1 text-xs font-semibold text-slate-950">
                {request.materialRequirementType === 'ASSISTANCE_REQUIRED'
                  ? 'Asesoría técnica'
                  : request.materialRequirement}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[9px] text-slate-500">Requerida</p>
              <p className="mt-1 text-xs font-semibold text-slate-950">
                {formatCustomerRequestDate(request.requestedDeliveryDate)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[9px] font-medium text-slate-500">Descripción</p>
            <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-700">
              {request.description}
            </p>
          </div>

          {request.materialRequirementType === 'ASSISTANCE_REQUIRED' ? (
            <div className="mt-5">
              <p className="text-[9px] font-medium text-slate-500">
                Contexto para asesoría
              </p>
              <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-700">
                {request.materialRequirement}
              </p>
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-950">Seguimiento</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-[9px] text-slate-500">Expediente</dt>
              <dd className="mt-1 text-xs font-semibold text-slate-950">
                {request.jobCase.caseNumber}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] text-slate-500">Etapa visible</dt>
              <dd className="mt-1 text-xs font-semibold text-slate-950">
                {status.stage}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] text-slate-500">Solicitada por</dt>
              <dd className="mt-1 text-xs font-semibold text-slate-950">
                {request.requestedByName}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] text-slate-500">Referencia cliente</dt>
              <dd className="mt-1 text-xs font-semibold text-slate-950">
                {request.customerReference ?? 'Sin referencia'}
              </dd>
            </div>
          </dl>
        </Card>
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
