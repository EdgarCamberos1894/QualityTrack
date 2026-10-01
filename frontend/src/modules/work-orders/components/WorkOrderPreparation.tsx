import { useSessionStore } from '@/modules/auth'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useWorkOrderPreparationMutations } from '../hooks/useWorkOrderPreparationMutations'
import type {
  ReopenRoutingFormValues,
  RoutingOperationFormValues,
  WorkOrderPlanningFormValues,
} from '../schemas/workOrderPreparation.schemas'
import type { WorkOrder360Dto } from '../types/workOrder360.types'
import { WorkOrderPinnedDocuments } from './WorkOrderPinnedDocuments'
import { WorkOrderPlanningCard } from './WorkOrderPlanningCard'
import { WorkOrderRoutingCard } from './WorkOrderRoutingCard'

interface WorkOrderPreparationProps {
  data: WorkOrder360Dto
}

export function WorkOrderPreparation({ data }: WorkOrderPreparationProps) {
  const session = useSessionStore((state) => state.session)
  const mutations = useWorkOrderPreparationMutations(data.workOrder.id)
  const roles = session?.user.roles ?? []
  const canPlan =
    roles.includes('ADMIN') ||
    roles.includes('COMMERCIAL') ||
    roles.includes('ENGINEERING')
  const canDesign = roles.includes('ADMIN') || roles.includes('ENGINEERING')
  const productionRouting = data.routingSheets.find(
    (routing) => routing.purpose === 'PRODUCTION',
  )
  const documentsEditable =
    canPlan &&
    data.workOrder.status === 'CREATED' &&
    (!productionRouting || productionRouting.status === 'DRAFT')

  const clearRoutingErrors = () => {
    mutations.createRouting.reset()
    mutations.addOperation.reset()
    mutations.updateOperation.reset()
    mutations.removeOperation.reset()
    mutations.approveRouting.reset()
    mutations.reopenRouting.reset()
    mutations.releaseRouting.reset()
  }

  const routingError =
    mutations.createRouting.error ??
    mutations.addOperation.error ??
    mutations.updateOperation.error ??
    mutations.removeOperation.error ??
    mutations.approveRouting.error ??
    mutations.reopenRouting.error ??
    mutations.releaseRouting.error

  const savePlanning = async (values: WorkOrderPlanningFormValues) => {
    try {
      await mutations.planning.mutateAsync(values)
      return true
    } catch {
      return false
    }
  }

  const pinDocument = async (documentId: number, versionId: number) => {
    try {
      await mutations.pinDocument.mutateAsync({ documentId, versionId })
    } catch {
      // The normalized API error is rendered by the document card.
    }
  }

  const createRouting = async () => {
    clearRoutingErrors()
    try {
      await mutations.createRouting.mutateAsync()
    } catch {
      // The normalized API error is rendered by the routing card.
    }
  }

  const addOperation = async (values: RoutingOperationFormValues) => {
    if (!productionRouting) return false
    clearRoutingErrors()
    try {
      await mutations.addOperation.mutateAsync({
        routingSheetId: productionRouting.id,
        payload: values,
      })
      return true
    } catch {
      return false
    }
  }

  const updateOperation = async (
    operationId: number,
    values: RoutingOperationFormValues,
  ) => {
    if (!productionRouting) return false
    clearRoutingErrors()
    try {
      await mutations.updateOperation.mutateAsync({
        routingSheetId: productionRouting.id,
        operationId,
        payload: values,
      })
      return true
    } catch {
      return false
    }
  }

  const removeOperation = async (operationId: number) => {
    if (!productionRouting) return
    clearRoutingErrors()
    try {
      await mutations.removeOperation.mutateAsync({
        routingSheetId: productionRouting.id,
        operationId,
      })
    } catch {
      // The normalized API error is rendered by the routing card.
    }
  }

  const approveRouting = async () => {
    if (!productionRouting) return
    clearRoutingErrors()
    try {
      await mutations.approveRouting.mutateAsync(productionRouting.id)
    } catch {
      // The normalized API error is rendered by the routing card.
    }
  }

  const reopenRouting = async (values: ReopenRoutingFormValues) => {
    if (!productionRouting) return false
    clearRoutingErrors()
    try {
      await mutations.reopenRouting.mutateAsync({
        routingSheetId: productionRouting.id,
        payload: values,
      })
      return true
    } catch {
      return false
    }
  }

  const releaseRouting = async () => {
    if (!productionRouting) return
    clearRoutingErrors()
    try {
      await mutations.releaseRouting.mutateAsync(productionRouting.id)
    } catch {
      // The normalized API error is rendered by the routing card.
    }
  }

  const planningReady =
    Boolean(data.workOrder.plannedQuantity) &&
    Boolean(data.workOrder.plannedStartDate) &&
    Boolean(data.workOrder.plannedEndDate)
  const documentsReady = data.workOrder.pinnedDocuments.length > 0
  const routingReady = productionRouting?.status === 'RELEASED'

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
        <div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Preparación operativa
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              De compromiso aprobado a paquete ejecutable
            </h2>
            <p className="mt-1 max-w-2xl text-[8px] leading-4 text-slate-500">
              Completa planificación, fija las versiones documentales y libera la hoja de ruta.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <PreparationStep label="Plan" complete={planningReady} />
            <PreparationStep label="Docs" complete={documentsReady} />
            <PreparationStep label="Ruta" complete={routingReady} />
          </div>
        </div>
      </section>

      {!session ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700">
          {getErrorMessage(new Error('No hay una sesión interna disponible.'))}
        </p>
      ) : null}

      <WorkOrderPlanningCard
        workOrder={data.workOrder}
        canEdit={canPlan && data.workOrder.status === 'CREATED'}
        saving={mutations.planning.isPending}
        error={mutations.planning.error}
        onSave={savePlanning}
      />

      <WorkOrderPinnedDocuments
        documents={data.documents.filter(
          ({ document }) => document.caseId !== null,
        )}
        pinnedDocuments={data.workOrder.pinnedDocuments}
        canEdit={documentsEditable}
        saving={mutations.pinDocument.isPending}
        error={mutations.pinDocument.error}
        onPin={pinDocument}
      />

      <WorkOrderRoutingCard
        routing={productionRouting}
        workOrderStatus={data.workOrder.status}
        pinnedDocumentCount={data.workOrder.pinnedDocuments.length}
        canDesign={canDesign}
        pending={{
          create: mutations.createRouting.isPending,
          operation:
            mutations.addOperation.isPending ||
            mutations.updateOperation.isPending ||
            mutations.removeOperation.isPending,
          approve: mutations.approveRouting.isPending,
          reopen: mutations.reopenRouting.isPending,
          release: mutations.releaseRouting.isPending,
        }}
        error={routingError}
        onCreate={createRouting}
        onAdd={addOperation}
        onUpdate={updateOperation}
        onRemove={removeOperation}
        onApprove={approveRouting}
        onReopen={reopenRouting}
        onRelease={releaseRouting}
      />
    </div>
  )
}

function PreparationStep({
  label,
  complete,
}: {
  label: string
  complete: boolean
}) {
  return (
    <div
      className={
        complete
          ? 'rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5'
          : 'rounded-lg border border-slate-200 bg-white px-2.5 py-1.5'
      }
    >
      <p
        className={
          complete
            ? 'text-[8px] font-semibold text-emerald-700'
            : 'text-[8px] font-semibold text-slate-400'
        }
      >
        {complete ? '✓ ' : ''}
        {label}
      </p>
    </div>
  )
}
