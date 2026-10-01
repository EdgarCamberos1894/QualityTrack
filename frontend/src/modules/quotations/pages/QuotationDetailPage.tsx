import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { WorkOrderCreationPanel, useWorkOrders } from '@/modules/work-orders'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { CancelQuotationDialog } from '../components/CancelQuotationDialog'
import { QuotationAdjustmentCard } from '../components/QuotationAdjustmentCard'
import { QuotationDetailHeader } from '../components/QuotationDetailHeader'
import { QuotationEditorForm } from '../components/QuotationEditorForm'
import { QuotationFlowSteps } from '../components/QuotationFlowSteps'
import { QuotationPreviewDialog } from '../components/QuotationPreviewDialog'
import { QuotationRevisionHistory } from '../components/QuotationRevisionHistory'
import { QuotationSourceCard } from '../components/QuotationSourceCard'
import { useQuotationDetail } from '../hooks/useQuotationDetail'
import {
  useCancelQuotation,
  useCreateQuotationRevision,
  useSendQuotation,
  useUpdateQuotation,
} from '../hooks/useQuotationMutations'
import { useQuotationRevisions } from '../hooks/useQuotationRevisions'
import type {
  SendQuotationPayload,
  UpdateQuotationPayload,
} from '../types/quotation.types'
import type { QuotationPreviewData } from '../schemas/quotation.schema'
import type { CancelQuotationFormValues } from '../schemas/quotationCancellation.schema'

const revisionEligibleStatuses = new Set(['REJECTED', 'EXPIRED', 'CANCELLED'])

export function QuotationDetailPage() {
  const { quotationId } = useParams()
  const navigate = useNavigate()
  const session = useSessionStore((state) => state.session)
  const [preview, setPreview] = useState<QuotationPreviewData | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const numericId = Number(quotationId)
  const validId =
    Number.isInteger(numericId) && numericId > 0 ? numericId : null
  const detailQuery = useQuotationDetail(validId)
  const revisionsQuery = useQuotationRevisions(validId)
  const updateMutation = useUpdateQuotation(validId ?? 0)
  const sendMutation = useSendQuotation(validId ?? 0)
  const revisionMutation = useCreateQuotationRevision(validId ?? 0)
  const cancelMutation = useCancelQuotation(validId ?? 0)
  const workOrdersQuery = useWorkOrders(detailQuery.data?.status === 'APPROVED')

  if (validId === null || !session) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={new Error('El identificador de la cotización no es válido.')}
          title="Cotización no disponible"
        />
      </PageContainer>
    )
  }

  if (detailQuery.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando cotización…" />
      </PageContainer>
    )
  }

  if (detailQuery.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={detailQuery.error}
          title="No pudimos cargar la cotización"
        />
      </PageContainer>
    )
  }

  const quotation = detailQuery.data
  const roles = session.user.roles
  const isAdmin = roles.includes('ADMIN')
  const isAssignedCommercial =
    roles.includes('COMMERCIAL') &&
    quotation.source.assignedToUserId !== null &&
    String(quotation.source.assignedToUserId) === session.user.id
  const canManage = isAdmin || isAssignedCommercial
  const editable = quotation.status === 'DRAFT' && canManage
  const canCreateRevision =
    canManage && revisionEligibleStatuses.has(quotation.status)
  const canCreateWorkOrder =
    roles.includes('ADMIN') || roles.includes('COMMERCIAL')
  const canCancel =
    canManage &&
    (quotation.status === 'DRAFT' || quotation.status === 'SENT') &&
    !(quotation.status === 'DRAFT' && Boolean(quotation.adjustmentNotes))
  const existingWorkOrder = workOrdersQuery.data?.find(
    (workOrder) => workOrder.caseId === quotation.caseId,
  )

  const mutationError =
    updateMutation.error ?? sendMutation.error ?? revisionMutation.error

  const save = async (payload: UpdateQuotationPayload) => {
    await updateMutation.mutateAsync(payload)
  }

  const send = async (
    payload: UpdateQuotationPayload,
    adjustmentResponse: string | null,
  ) => {
    await updateMutation.mutateAsync(payload)

    const sendPayload: SendQuotationPayload | undefined = adjustmentResponse
      ? { adjustmentResponse }
      : undefined

    await sendMutation.mutateAsync(sendPayload)
  }

  const createRevision = async () => {
    const next = await revisionMutation.mutateAsync()
    navigate(`/quotations/${next.id}`, { replace: true })
  }

  const cancel = async (values: CancelQuotationFormValues) => {
    try {
      await cancelMutation.mutateAsync({
        reason: values.reason.trim() || undefined,
      })
      return true
    } catch {
      return false
    }
  }

  const revisions =
    revisionsQuery.data ?? (revisionsQuery.isPending ? [] : [quotation])

  const readOnlyTitle =
    quotation.status === 'DRAFT'
      ? 'Borrador de solo lectura'
      : quotation.status === 'SENT'
        ? 'Revisión enviada al cliente'
        : 'Revisión congelada'

  const readOnlyDescription =
    quotation.status === 'DRAFT'
      ? 'Solo el responsable comercial o un administrador puede modificar este borrador.'
      : quotation.status === 'SENT'
        ? 'La revisión está esperando una respuesta del cliente y conserva sus datos enviados.'
        : 'Esta revisión conserva sus datos históricos y ya no admite edición directa.'

  return (
    <PageContainer className="py-4 lg:py-3">
      <QuotationDetailHeader quotation={quotation} />

      <div className="space-y-3">
        <QuotationFlowSteps />
        <QuotationSourceCard source={quotation.source} />
        <QuotationAdjustmentCard quotation={quotation} />

        {quotation.status === 'CANCELLED' ? (
          <section className="flex flex-col gap-3 rounded-xl border border-red-200 bg-white px-3.5 py-3 shadow-[0_10px_28px_-26px_rgba(185,28,28,0.2)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-red-600">
                Revisión cancelada
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-slate-700">
                {quotation.cancellationReason?.trim()
                  ? quotation.cancellationReason
                  : 'No se registró un motivo de cancelación.'}
              </p>
            </div>

            {canCreateRevision ? (
              <Button
                size="sm"
                className="!h-7 !px-2.5 !text-[8px]"
                onClick={() => void createRevision()}
                disabled={revisionMutation.isPending}
              >
                {revisionMutation.isPending
                  ? 'Creando revisión…'
                  : 'Crear nueva revisión'}
              </Button>
            ) : null}
          </section>
        ) : canCancel || !editable ? (
          <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-[0_10px_28px_-26px_rgba(15,23,42,0.2)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Control de revisión
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-900">
                {editable ? 'Borrador en preparación' : readOnlyTitle}
              </p>
              <p className="mt-1 max-w-2xl text-[8px] leading-4 text-slate-500">
                {editable
                  ? 'Puedes cancelar esta revisión mientras siga en borrador.'
                  : readOnlyDescription}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-1.5">
              {canCreateRevision ? (
                <Button
                  size="sm"
                  className="!h-7 !px-2.5 !text-[8px]"
                  onClick={() => void createRevision()}
                  disabled={revisionMutation.isPending}
                >
                  {revisionMutation.isPending
                    ? 'Creando revisión…'
                    : 'Crear nueva revisión'}
                </Button>
              ) : null}

              {canCancel ? (
                <Button
                  size="sm"
                  variant="danger"
                  className="!h-7 !px-2.5 !text-[8px]"
                  onClick={() => {
                    cancelMutation.reset()
                    setCancelOpen(true)
                  }}
                >
                  Cancelar cotización
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}

        {quotation.status === 'APPROVED' ? (
          workOrdersQuery.isPending ? (
            <LoadingState label="Comprobando orden de trabajo…" />
          ) : workOrdersQuery.isError ? (
            <section className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5">
              <p className="text-[9px] font-semibold text-amber-900">
                No pudimos comprobar si el expediente ya tiene una orden de trabajo.
              </p>
              <p className="mt-1 text-[8px] leading-4 text-amber-800">
                Vuelve a intentarlo antes de crear una OT para evitar duplicados.
              </p>
            </section>
          ) : (
            <WorkOrderCreationPanel
              caseId={quotation.caseId}
              quotationNumber={quotation.quotationNumber}
              quotationRevision={quotation.revision}
              customerName={quotation.customerName}
              plannedQuantity={quotation.source.quantity}
              agreedDeliveryDate={quotation.estimatedDeliveryDate}
              canCreate={canCreateWorkOrder}
              existingWorkOrder={existingWorkOrder}
              onCreated={(workOrder) =>
                navigate(`/work-orders/${workOrder.id}`)
              }
            />
          )
        ) : null}

        {mutationError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700"
          >
            {getErrorMessage(mutationError)}
          </div>
        ) : null}

        <QuotationEditorForm
          quotation={quotation}
          editable={editable}
          saving={updateMutation.isPending}
          sending={sendMutation.isPending}
          onSave={save}
          onSend={send}
          onPreview={setPreview}
        />

        {revisionsQuery.isError ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[9px] text-amber-700">
            No fue posible cargar el historial de revisiones.
          </p>
        ) : revisionsQuery.isPending ? (
          <LoadingState label="Cargando revisiones…" />
        ) : (
          <QuotationRevisionHistory
            revisions={revisions}
            currentId={quotation.id}
          />
        )}
      </div>

      <CancelQuotationDialog
        quotation={cancelOpen ? quotation : null}
        submitting={cancelMutation.isPending}
        error={cancelMutation.error}
        onClose={() => {
          cancelMutation.reset()
          setCancelOpen(false)
        }}
        onSubmit={cancel}
      />

      {preview ? (
        <QuotationPreviewDialog
          quotation={quotation}
          preview={preview}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </PageContainer>
  )
}
