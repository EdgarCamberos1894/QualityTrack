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
      <PageContainer>
        <ErrorState
          error={new Error('El identificador de la cotización no es válido.')}
          title="Cotización no disponible"
        />
      </PageContainer>
    )
  }

  if (detailQuery.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando cotización…" />
      </PageContainer>
    )
  }

  if (detailQuery.isError) {
    return (
      <PageContainer>
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
  const isCommercialOwner =
    roles.includes('COMMERCIAL') &&
    String(quotation.createdByUserId) === session.user.id
  const canManage = isAdmin || isCommercialOwner
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

  return (
    <PageContainer>
      <QuotationDetailHeader quotation={quotation} />

      <div className="space-y-4">
        <QuotationFlowSteps />
        <QuotationSourceCard source={quotation.source} />
        <QuotationAdjustmentCard quotation={quotation} />

        {quotation.status === 'CANCELLED' ? (
          <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
            <p className="text-xs font-semibold text-red-900">
              Cotización cancelada
            </p>
            <p className="mt-1 text-[10px] leading-5 text-red-800">
              {quotation.cancellationReason?.trim()
                ? quotation.cancellationReason
                : 'No se registró un motivo de cancelación.'}
            </p>
          </section>
        ) : canCancel ? (
          <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Cancelar esta revisión
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                La revisión quedará cerrada y conservará todo su historial.
              </p>
            </div>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                cancelMutation.reset()
                setCancelOpen(true)
              }}
            >
              Cancelar cotización
            </Button>
          </section>
        ) : null}

        {quotation.status === 'APPROVED' ? (
          workOrdersQuery.isPending ? (
            <LoadingState label="Comprobando orden de trabajo…" />
          ) : workOrdersQuery.isError ? (
            <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold text-amber-900">
                No pudimos comprobar si el expediente ya tiene una orden de
                trabajo.
              </p>
              <p className="mt-1 text-[10px] text-amber-800">
                Vuelve a intentarlo antes de crear una OT para evitar
                duplicados.
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
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {getErrorMessage(mutationError)}
          </div>
        ) : null}

        {!editable ? (
          <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900">
                {quotation.status === 'DRAFT'
                  ? 'Revisión de solo lectura'
                  : 'Revisión congelada'}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                {quotation.status === 'DRAFT'
                  ? 'Solo el responsable comercial o un administrador puede modificar este borrador.'
                  : 'Una revisión enviada o cerrada conserva sus datos históricos y ya no se edita.'}
              </p>
            </div>

            {canCreateRevision ? (
              <Button
                size="sm"
                onClick={() => void createRevision()}
                disabled={revisionMutation.isPending}
              >
                {revisionMutation.isPending
                  ? 'Creando revisión…'
                  : 'Crear nueva revisión'}
              </Button>
            ) : null}
          </section>
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
          <p className="text-xs text-amber-700">
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
