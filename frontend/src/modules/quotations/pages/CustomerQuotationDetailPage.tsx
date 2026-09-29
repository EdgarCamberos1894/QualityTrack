import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCustomerPortalContext } from '@/modules/customer-portal'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { Button } from '@/shared/components/ui/Button'
import { ApproveQuotationDialog } from '../components/ApproveQuotationDialog'
import { CustomerQuotationAdjustmentNotice } from '../components/CustomerQuotationAdjustmentNotice'
import { CustomerQuotationDocument } from '../components/CustomerQuotationDocument'
import { CustomerQuotationHeader } from '../components/CustomerQuotationHeader'
import { CustomerQuotationRevisionHistory } from '../components/CustomerQuotationRevisionHistory'
import { CustomerQuotationSourceCard } from '../components/CustomerQuotationSourceCard'
import { QuotationFlowSteps } from '../components/QuotationFlowSteps'
import { RejectQuotationDialog } from '../components/RejectQuotationDialog'
import { RequestAdjustmentDialog } from '../components/RequestAdjustmentDialog'
import {
  useCustomerQuotationDetail,
  useCustomerQuotationRevisions,
} from '../hooks/useCustomerQuotationDetail'
import {
  useApproveCustomerQuotation,
  useRejectCustomerQuotation,
  useRequestCustomerQuotationAdjustment,
} from '../hooks/useCustomerQuotationMutations'
import { formatQuotationDate } from '../model/quotationPresenter'
import type {
  CustomerAdjustmentFormValues,
  CustomerRejectionFormValues,
} from '../schemas/customerQuotation.schemas'

type Dialog = 'approve' | 'adjust' | 'reject' | null

export function CustomerQuotationDetailPage() {
  const { quotationId } = useParams()
  const { customer } = useCustomerPortalContext()
  const [dialog, setDialog] = useState<Dialog>(null)
  const numericId = Number(quotationId)
  const validId =
    Number.isInteger(numericId) && numericId > 0 ? numericId : null
  const detailQuery = useCustomerQuotationDetail(customer.customerId, validId)
  const revisionsQuery = useCustomerQuotationRevisions(
    customer.customerId,
    validId,
  )
  const approveMutation = useApproveCustomerQuotation(
    customer.customerId,
    validId ?? 0,
  )
  const adjustmentMutation = useRequestCustomerQuotationAdjustment(
    customer.customerId,
    validId ?? 0,
  )
  const rejectMutation = useRejectCustomerQuotation(
    customer.customerId,
    validId ?? 0,
  )

  if (validId === null) {
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
  const canDecide =
    customer.role !== 'VIEWER' && quotation.customerStatus === 'SENT'
  const mutationPending =
    approveMutation.isPending ||
    adjustmentMutation.isPending ||
    rejectMutation.isPending

  const approve = async () => {
    try {
      await approveMutation.mutateAsync()
      setDialog(null)
    } catch {
      // The mutation exposes the normalized error inside the active dialog.
    }
  }

  const requestAdjustment = async (values: CustomerAdjustmentFormValues) => {
    try {
      await adjustmentMutation.mutateAsync(values)
      setDialog(null)
      return true
    } catch {
      // The mutation exposes the normalized error inside the active dialog.
      return false
    }
  }

  const reject = async (values: CustomerRejectionFormValues) => {
    try {
      await rejectMutation.mutateAsync({
        ...(values.reason.trim() ? { reason: values.reason.trim() } : {}),
      })
      setDialog(null)
      return true
    } catch {
      // The mutation exposes the normalized error inside the active dialog.
      return false
    }
  }

  const openDialog = (nextDialog: Exclude<Dialog, null>) => {
    approveMutation.reset()
    adjustmentMutation.reset()
    rejectMutation.reset()
    setDialog(nextDialog)
  }

  const closeDialog = () => {
    approveMutation.reset()
    adjustmentMutation.reset()
    rejectMutation.reset()
    setDialog(null)
  }

  return (
    <PageContainer>
      <CustomerQuotationHeader
        quotation={quotation}
        customerName={customer.customerName}
      />

      <div className="space-y-4">
        <QuotationFlowSteps />
        <CustomerQuotationSourceCard
          source={quotation.source}
          caseNumber={quotation.caseNumber}
          requestNumber={quotation.requestNumber}
        />
        <CustomerQuotationAdjustmentNotice quotation={quotation} />

        <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Condiciones principales
            </p>
            <p className="mt-1 text-xs text-slate-700">
              Vigencia: {formatQuotationDate(quotation.validUntil)} · Entrega
              estimada: {formatQuotationDate(quotation.estimatedDeliveryDate)}
            </p>
          </div>

          {canDecide ? (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => openDialog('adjust')}
              >
                Solicitar ajuste
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => openDialog('reject')}
              >
                Rechazar
              </Button>
              <Button size="sm" onClick={() => openDialog('approve')}>
                Aprobar cotización
              </Button>
            </div>
          ) : null}
        </section>

        {customer.role === 'VIEWER' && quotation.customerStatus === 'SENT' ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Tu rol es de consulta. Un administrador o solicitante de la empresa
            debe responder esta cotización.
          </p>
        ) : null}

        {quotation.customerStatus === 'REJECTED' &&
        quotation.rejectionReason ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            Motivo de rechazo: {quotation.rejectionReason}
          </p>
        ) : null}

        <CustomerQuotationDocument quotation={quotation} />

        {revisionsQuery.isPending ? (
          <LoadingState label="Cargando revisiones…" />
        ) : revisionsQuery.isError ? (
          <p className="text-xs text-amber-700">
            No fue posible cargar el historial de revisiones.
          </p>
        ) : (
          <CustomerQuotationRevisionHistory
            customerId={customer.customerId}
            currentId={quotation.id}
            revisions={revisionsQuery.data}
          />
        )}
      </div>

      <ApproveQuotationDialog
        open={dialog === 'approve'}
        submitting={mutationPending}
        error={approveMutation.error}
        onClose={closeDialog}
        onConfirm={() => void approve()}
      />
      <RequestAdjustmentDialog
        open={dialog === 'adjust'}
        submitting={mutationPending}
        error={adjustmentMutation.error}
        onClose={closeDialog}
        onSubmit={requestAdjustment}
      />
      <RejectQuotationDialog
        open={dialog === 'reject'}
        submitting={mutationPending}
        error={rejectMutation.error}
        onClose={closeDialog}
        onSubmit={reject}
      />
    </PageContainer>
  )
}
