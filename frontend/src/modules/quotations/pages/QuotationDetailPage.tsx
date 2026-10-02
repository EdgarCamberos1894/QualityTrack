import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { WorkOrderCreationPanel, useWorkOrders } from '@/modules/work-orders'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { CancelQuotationDialog } from '../components/CancelQuotationDialog'
import { QuotationAdjustmentCard } from '../components/QuotationAdjustmentCard'
import { QuotationDetailHeader } from '../components/QuotationDetailHeader'
import { QuotationEditorForm } from '../components/QuotationEditorForm'
import { QuotationFlowSteps } from '../components/QuotationFlowSteps'
import { QuotationPreviewDialog } from '../components/QuotationPreviewDialog'
import { QuotationRevisionHistory } from '../components/QuotationRevisionHistory'
import { QuotationSourceCard } from '../components/QuotationSourceCard'
import { SendQuotationConfirmationDialog } from '../components/SendQuotationConfirmationDialog'
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
  const [pendingSend, setPendingSend] = useState<{
    payload: UpdateQuotationPayload
    adjustmentResponse: string | null
    preview: QuotationPreviewData
  } | null>(null)
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

  const requestSend = (
    payload: UpdateQuotationPayload,
    adjustmentResponse: string | null,
    previewData: QuotationPreviewData,
  ) => {
    updateMutation.reset()
    sendMutation.reset()
    setPendingSend({
      payload,
      adjustmentResponse,
      preview: previewData,
    })
  }

  const confirmSend = async () => {
    if (!pendingSend) return

    try {
      await send(pendingSend.payload, pendingSend.adjustmentResponse)
      setPendingSend(null)
    } catch {
      // Mutation errors remain visible in the confirmation dialog.
    }
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

  return (
    <PageContainer className="py-4 lg:py-3">
      <QuotationDetailHeader
        quotation={quotation}
        canCancel={canCancel}
        canCreateRevision={canCreateRevision}
        creatingRevision={revisionMutation.isPending}
        onCancel={() => {
          cancelMutation.reset()
          setCancelOpen(true)
        }}
        onCreateRevision={() => void createRevision()}
      />

      <div className="space-y-3">
        <QuotationFlowSteps />
        <QuotationSourceCard source={quotation.source} />
        <QuotationAdjustmentCard quotation={quotation} />

        {quotation.status === 'CANCELLED' ? (
          <section className="rounded-xl border border-red-200 bg-red-50/45 px-3.5 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-red-600">
              Revisión cancelada
            </p>
            <p className="mt-1 text-[9px] leading-4 text-red-900/75">
              {quotation.cancellationReason?.trim()
                ? quotation.cancellationReason
                : 'No se registró un motivo de cancelación.'}
            </p>
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
          onSend={requestSend}
          onPreview={setPreview}
          sidebarContent={
            revisionsQuery.isError ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-[8px] leading-4 text-amber-700">
                No fue posible cargar el historial de revisiones.
              </p>
            ) : revisions.length > 1 ? (
              <QuotationRevisionHistory
                revisions={revisions}
                currentId={quotation.id}
              />
            ) : null
          }
        />
      </div>

      {pendingSend ? (
        <SendQuotationConfirmationDialog
          quotation={quotation}
          preview={pendingSend.preview}
          submitting={updateMutation.isPending || sendMutation.isPending}
          error={updateMutation.error ?? sendMutation.error}
          onClose={() => {
            if (!updateMutation.isPending && !sendMutation.isPending) {
              updateMutation.reset()
              sendMutation.reset()
              setPendingSend(null)
            }
          }}
          onConfirm={() => void confirmSend()}
        />
      ) : null}

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
