import { useMemo, useState } from 'react'
import { useSessionStore } from '@/modules/auth'
import { useMachines } from '@/modules/machines'
import { CancelExecutionDialog } from './CancelExecutionDialog'
import { CompleteExecutionDialog } from './CompleteExecutionDialog'
import { ReworkOperationCard } from './ReworkOperationCard'
import { StartOperationDialog } from './StartOperationDialog'
import { useReworkMutations } from '../hooks/useReworkMutations'
import type {
  CancelOperationExecutionFormValues,
  CompleteOperationExecutionFormValues,
  StartOperationExecutionFormValues,
} from '../schemas/production.schemas'
import type { NonConformityDto } from '../types/quality.types'
import type {
  OperationExecutionDto,
  RoutingOperationDto,
  RoutingSheetDto,
  WorkOrderStatus,
} from '../types/workOrder.types'

interface ReworkExecutionPanelProps {
  routing: RoutingSheetDto
  nonConformity: NonConformityDto
  executions: OperationExecutionDto[]
  workOrderStatus: WorkOrderStatus
}

export function ReworkExecutionPanel({
  routing,
  nonConformity,
  executions,
  workOrderStatus,
}: ReworkExecutionPanelProps) {
  const session = useSessionStore((state) => state.session)
  const roles = session?.user.roles ?? []
  const canExecute = roles.includes('ADMIN') || roles.includes('PRODUCTION')
  const executionOpen =
    workOrderStatus === 'QUALITY_HOLD' ||
    workOrderStatus === 'REWORK_IN_PROGRESS'
  const machinesQuery = useMachines(
    canExecute && routing.status === 'RELEASED' && executionOpen,
  )
  const mutations = useReworkMutations()
  const [startOperation, setStartOperation] =
    useState<RoutingOperationDto | null>(null)
  const [activeExecution, setActiveExecution] =
    useState<OperationExecutionDto | null>(null)
  const [dialog, setDialog] = useState<'complete' | 'cancel' | null>(null)

  const routingExecutions = useMemo(
    () =>
      executions.filter(
        (execution) =>
          execution.routingSheetId === routing.id &&
          execution.routingPurpose === 'REWORK',
      ),
    [executions, routing.id],
  )

  const operations = useMemo(
    () =>
      [...routing.operations].sort(
        (left, right) => left.sequenceNumber - right.sequenceNumber,
      ),
    [routing.operations],
  )

  const completedOperationIds = useMemo(
    () =>
      new Set(
        routingExecutions
          .filter((execution) => execution.status === 'COMPLETED')
          .map((execution) => execution.routingOperationId),
      ),
    [routingExecutions],
  )

  const clearErrors = () => {
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
      setDialog(null)
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
      setDialog(null)
      setActiveExecution(null)
      return true
    } catch {
      return false
    }
  }

  if (routing.status !== 'RELEASED') return null

  const routingCompleted =
    operations.length > 0 && completedOperationIds.size === operations.length

  return (
    <section className="mt-4 rounded-xl border border-orange-200 bg-orange-50/30 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-orange-700">
            Ejecución de retrabajo
          </p>
          <h3 className="mt-1 text-sm font-semibold text-slate-950">
            Rev {routing.revision} · {nonConformity.number}
          </h3>
          <p className="mt-1 text-[10px] leading-5 text-slate-600">
            La primera operación cambia la OT a REWORK_IN_PROGRESS. Al completar
            toda la ruta, el backend crea una nueva inspección PENDING.
          </p>
        </div>

        <span className="rounded-full bg-white px-3 py-1 text-[9px] font-semibold text-slate-600">
          {completedOperationIds.size}/{operations.length} completadas
        </span>
      </div>

      {!canExecute ? (
        <p className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-600">
          Solo PRODUCTION o ADMIN pueden ejecutar las operaciones de retrabajo.
        </p>
      ) : null}

      {machinesQuery.isError ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-800">
          No pudimos cargar máquinas. El retrabajo puede iniciarse sin máquina
          si la operación lo permite.
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {operations.map((operation, index) => {
          const operationExecutions = routingExecutions.filter(
            (execution) => execution.routingOperationId === operation.id,
          )
          const unlocked = operations
            .slice(0, index)
            .every((previous) => completedOperationIds.has(previous.id))

          return (
            <ReworkOperationCard
              key={operation.id}
              operation={operation}
              executions={operationExecutions}
              workOrderStatus={workOrderStatus}
              unlocked={unlocked}
              canExecute={canExecute}
              onStart={(selected) => {
                clearErrors()
                setStartOperation(selected)
              }}
              onComplete={(execution) => {
                clearErrors()
                setActiveExecution(execution)
                setDialog('complete')
              }}
              onCancel={(execution) => {
                clearErrors()
                setActiveExecution(execution)
                setDialog('cancel')
              }}
            />
          )
        })}
      </div>

      {routingCompleted && workOrderStatus === 'QUALITY_PENDING' ? (
        <p className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 text-[10px] leading-5 text-blue-800">
          Retrabajo completado. Se creó una nueva reinspección PENDING ligada a{' '}
          {nonConformity.number}. Continúa en la sección de inspecciones.
        </p>
      ) : null}

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
        open={dialog === 'complete'}
        execution={activeExecution}
        plannedQuantity={nonConformity.affectedQuantity ?? 1}
        submitting={mutations.completeExecution.isPending}
        error={mutations.completeExecution.error}
        onClose={() => {
          mutations.completeExecution.reset()
          setDialog(null)
          setActiveExecution(null)
        }}
        onSubmit={complete}
      />

      <CancelExecutionDialog
        open={dialog === 'cancel'}
        execution={activeExecution}
        submitting={mutations.cancelExecution.isPending}
        error={mutations.cancelExecution.error}
        onClose={() => {
          mutations.cancelExecution.reset()
          setDialog(null)
          setActiveExecution(null)
        }}
        onSubmit={cancel}
      />
    </section>
  )
}
