import { useMemo, useState } from 'react'
import { useSessionStore } from '@/modules/auth'
import { useMachines } from '@/modules/machines'
import type { RecordMaterialConsumptionPayload } from '@/modules/materials'
import { CancelExecutionDialog } from './CancelExecutionDialog'
import { CompleteExecutionDialog } from './CompleteExecutionDialog'
import { ProductionMaterialsCard } from './ProductionMaterialsCard'
import { ProductionOperationCard } from './ProductionOperationCard'
import { ProductionProgressHeader } from './ProductionProgressHeader'
import { QualityHandoffPanel } from './QualityHandoffPanel'
import { StartOperationDialog } from './StartOperationDialog'
import { ProductionBlocker } from './ProductionBlocker'
import { useProductionMutations } from '../hooks/useProductionMutations'
import type {
  CancelOperationExecutionFormValues,
  CompleteOperationExecutionFormValues,
  StartOperationExecutionFormValues,
} from '../schemas/production.schemas'
import type {
  OperationExecutionDto,
  RoutingOperationDto,
} from '../types/workOrder.types'
import type { WorkOrder360Dto } from '../types/workOrder360.types'

interface WorkOrderProductionProps {
  data: WorkOrder360Dto
}

export function WorkOrderProduction({ data }: WorkOrderProductionProps) {
  const session = useSessionStore((state) => state.session)
  const roles = session?.user.roles ?? []
  const canExecute = roles.includes('ADMIN') || roles.includes('PRODUCTION')
  const productionRouting = data.routingSheets.find(
    (routing) => routing.purpose === 'PRODUCTION',
  )
  const routingReleased = productionRouting?.status === 'RELEASED'
  const machinesQuery = useMachines(canExecute && Boolean(routingReleased))
  const mutations = useProductionMutations(data.workOrder.id)
  const [startOperation, setStartOperation] =
    useState<RoutingOperationDto | null>(null)
  const [activeExecution, setActiveExecution] =
    useState<OperationExecutionDto | null>(null)
  const [executionDialog, setExecutionDialog] = useState<
    'complete' | 'cancel' | null
  >(null)

  const productionExecutions = useMemo(
    () =>
      data.production.executions.filter(
        (execution) =>
          productionRouting &&
          execution.routingSheetId === productionRouting.id &&
          execution.routingPurpose === 'PRODUCTION',
      ),
    [data.production.executions, productionRouting],
  )

  const operations = useMemo(
    () =>
      [...(productionRouting?.operations ?? [])].sort(
        (left, right) => left.sequenceNumber - right.sequenceNumber,
      ),
    [productionRouting],
  )

  const completedOperationIds = useMemo(
    () =>
      new Set(
        productionExecutions
          .filter((execution) => execution.status === 'COMPLETED')
          .map((execution) => execution.routingOperationId),
      ),
    [productionExecutions],
  )

  const completedOperations = completedOperationIds.size
  const productionOpen =
    data.workOrder.status === 'IN_PRODUCTION' &&
    !data.production.productionCompleted

  const clearExecutionErrors = () => {
    mutations.startExecution.reset()
    mutations.completeExecution.reset()
    mutations.cancelExecution.reset()
  }

  const start = async (values: StartOperationExecutionFormValues) => {
    if (!startOperation) return false

    try {
      await mutations.startExecution.mutateAsync({
        operationId: startOperation.id,
        payload: {
          ...(values.machineId ? { machineId: Number(values.machineId) } : {}),
          ...(values.startNotes.trim()
            ? { startNotes: values.startNotes.trim() }
            : {}),
        },
      })
      setStartOperation(null)
      return true
    } catch {
      return false
    }
  }

  const complete = async (values: CompleteOperationExecutionFormValues) => {
    if (!activeExecution) return false

    try {
      await mutations.completeExecution.mutateAsync({
        executionId: activeExecution.id,
        payload: {
          quantityProcessed: values.quantityProcessed,
          quantityAccepted: values.quantityAccepted,
          quantityRejected: values.quantityRejected,
          ...(values.completionNotes.trim()
            ? { completionNotes: values.completionNotes.trim() }
            : {}),
        },
      })
      setExecutionDialog(null)
      setActiveExecution(null)
      return true
    } catch {
      return false
    }
  }

  const cancel = async (values: CancelOperationExecutionFormValues) => {
    if (!activeExecution) return false

    try {
      await mutations.cancelExecution.mutateAsync({
        executionId: activeExecution.id,
        payload: {
          cancellationReason: values.cancellationReason.trim(),
        },
      })
      setExecutionDialog(null)
      setActiveExecution(null)
      return true
    } catch {
      return false
    }
  }

  const recordMaterial = async (payload: RecordMaterialConsumptionPayload) => {
    try {
      await mutations.recordConsumption.mutateAsync(payload)
      return true
    } catch {
      return false
    }
  }

  const openComplete = (execution: OperationExecutionDto) => {
    clearExecutionErrors()
    setActiveExecution(execution)
    setExecutionDialog('complete')
  }

  const openCancel = (execution: OperationExecutionDto) => {
    clearExecutionErrors()
    setActiveExecution(execution)
    setExecutionDialog('cancel')
  }

  return (
    <div className="space-y-4">
      <ProductionProgressHeader
        production={data.production}
        routing={productionRouting}
        completedOperations={completedOperations}
      />

      {!productionRouting ? (
        <ProductionBlocker text="La orden todavía no tiene una hoja de ruta de producción." />
      ) : !routingReleased ? (
        <ProductionBlocker text="La hoja de ruta debe aprobarse y liberarse desde Preparación antes de ejecutar operaciones." />
      ) : null}

      {!canExecute ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] leading-5 text-slate-600">
          La ejecución es de solo lectura para tu rol. Solo PRODUCTION o ADMIN
          pueden iniciar, finalizar o cancelar intentos y registrar consumos.
        </p>
      ) : null}

      {machinesQuery.isError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          No pudimos cargar el catálogo de máquinas. Las operaciones todavía
          pueden iniciarse sin máquina asignada.
        </p>
      ) : null}

      {operations.length > 0 ? (
        <section className="space-y-3">
          {operations.map((operation, index) => {
            const executions = productionExecutions.filter(
              (execution) => execution.routingOperationId === operation.id,
            )
            const unlocked = operations
              .slice(0, index)
              .every((previous) => completedOperationIds.has(previous.id))

            return (
              <ProductionOperationCard
                key={operation.id}
                operation={operation}
                executions={executions}
                workOrderStatus={data.workOrder.status}
                unlocked={routingReleased === true && unlocked}
                canExecute={canExecute}
                productionCompleted={data.production.productionCompleted}
                onStart={(selected) => {
                  clearExecutionErrors()
                  setStartOperation(selected)
                }}
                onComplete={openComplete}
                onCancel={openCancel}
              />
            )
          })}
        </section>
      ) : productionRouting ? (
        <ProductionBlocker text="La hoja de ruta no contiene operaciones ejecutables." />
      ) : null}

      <ProductionMaterialsCard
        consumptions={data.materials}
        canRecord={canExecute && productionOpen}
        submitting={mutations.recordConsumption.isPending}
        error={mutations.recordConsumption.error}
        onRecord={recordMaterial}
      />

      <QualityHandoffPanel
        workOrderId={data.workOrder.id}
        workOrderStatus={data.workOrder.status}
        productionCompleted={data.production.productionCompleted}
        canHandoff={canExecute}
      />

      <StartOperationDialog
        open={startOperation !== null}
        operation={startOperation}
        operatorLabel={session?.user.email ?? 'Usuario actual'}
        machines={machinesQuery.data ?? []}
        submitting={mutations.startExecution.isPending}
        error={mutations.startExecution.error}
        onClose={() => {
          mutations.startExecution.reset()
          setStartOperation(null)
        }}
        onSubmit={start}
      />

      <CompleteExecutionDialog
        open={executionDialog === 'complete'}
        execution={activeExecution}
        plannedQuantity={data.production.plannedQuantity}
        submitting={mutations.completeExecution.isPending}
        error={mutations.completeExecution.error}
        onClose={() => {
          mutations.completeExecution.reset()
          setExecutionDialog(null)
          setActiveExecution(null)
        }}
        onSubmit={complete}
      />

      <CancelExecutionDialog
        open={executionDialog === 'cancel'}
        execution={activeExecution}
        submitting={mutations.cancelExecution.isPending}
        error={mutations.cancelExecution.error}
        onClose={() => {
          mutations.cancelExecution.reset()
          setExecutionDialog(null)
          setActiveExecution(null)
        }}
        onSubmit={cancel}
      />
    </div>
  )
}
