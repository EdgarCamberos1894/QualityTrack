import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  executionDurationMinutes,
  formatProductionDateTime,
  getExecutionPresentation,
} from '../model/productionPresenter'
import type {
  OperationExecutionDto,
  RoutingOperationDto,
  WorkOrderStatus,
} from '../types/workOrder.types'

interface ProductionOperationCardProps {
  operation: RoutingOperationDto
  executions: OperationExecutionDto[]
  workOrderStatus: WorkOrderStatus
  unlocked: boolean
  canExecute: boolean
  productionCompleted: boolean
  onStart: (operation: RoutingOperationDto) => void
  onComplete: (execution: OperationExecutionDto) => void
  onCancel: (execution: OperationExecutionDto) => void
}

export function ProductionOperationCard({
  operation,
  executions,
  workOrderStatus,
  unlocked,
  canExecute,
  productionCompleted,
  onStart,
  onComplete,
  onCancel,
}: ProductionOperationCardProps) {
  const orderedAttempts = [...executions].sort(
    (left, right) => left.attemptNumber - right.attemptNumber,
  )
  const completed = orderedAttempts.find(
    (execution) => execution.status === 'COMPLETED',
  )
  const inProgress = orderedAttempts.find(
    (execution) => execution.status === 'IN_PROGRESS',
  )
  const cancelledCount = orderedAttempts.filter(
    (execution) => execution.status === 'CANCELLED',
  ).length
  const productionOpen =
    workOrderStatus === 'READY_FOR_PRODUCTION' ||
    workOrderStatus === 'IN_PRODUCTION'
  const canStart =
    canExecute &&
    unlocked &&
    productionOpen &&
    !productionCompleted &&
    !completed &&
    !inProgress

  return (
    <article
      className={
        inProgress
          ? 'rounded-xl border border-amber-300 bg-amber-50/40 p-4'
          : completed
            ? 'rounded-xl border border-emerald-200 bg-emerald-50/30 p-4'
            : 'rounded-xl border border-slate-200 bg-white p-4'
      }
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <span
            className={
              completed
                ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700'
                : inProgress
                  ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700'
                  : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600'
            }
          >
            {completed ? '✓' : operation.sequenceNumber}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                {operation.code}
              </p>
              {inProgress ? (
                <Badge tone="warning">En ejecución</Badge>
              ) : completed ? (
                <Badge tone="success">Completada</Badge>
              ) : cancelledCount > 0 ? (
                <Badge tone="danger">
                  {cancelledCount === 1
                    ? '1 intento cancelado'
                    : `${cancelledCount} intentos cancelados`}
                </Badge>
              ) : !unlocked ? (
                <Badge tone="neutral">Bloqueada</Badge>
              ) : (
                <Badge tone="neutral">Pendiente</Badge>
              )}
            </div>

            <h3 className="mt-1 text-sm font-semibold text-slate-950">
              {operation.name}
            </h3>
            <p className="mt-1 text-[10px] text-slate-500">
              Estimado · {operation.estimatedMinutes} min
            </p>
            {operation.instructions ? (
              <p className="mt-2 max-w-3xl text-[10px] leading-5 text-slate-600">
                {operation.instructions}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {canStart ? (
            <Button size="sm" onClick={() => onStart(operation)}>
              {cancelledCount > 0 ? 'Reintentar' : 'Iniciar operación'}
            </Button>
          ) : null}

          {inProgress && canExecute ? (
            <>
              <Button size="sm" onClick={() => onComplete(inProgress)}>
                Finalizar
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => onCancel(inProgress)}
              >
                Cancelar intento
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {!unlocked && !completed ? (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-600">
          Completa la operación anterior para habilitar este paso.
        </p>
      ) : null}

      {orderedAttempts.length > 0 ? (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            Historial de intentos
          </p>
          <div className="mt-2 grid gap-2">
            {orderedAttempts.map((execution) => {
              const presentation = getExecutionPresentation(execution.status)
              const duration = executionDurationMinutes(execution)

              return (
                <div
                  key={execution.id}
                  className="grid gap-2 rounded-lg bg-white px-3 py-3 text-[10px] text-slate-600 sm:grid-cols-[70px_110px_1fr_1fr_auto]"
                >
                  <span className="font-semibold text-slate-900">
                    Intento {execution.attemptNumber}
                  </span>
                  <Badge tone={presentation.tone}>
                    {presentation.label}
                  </Badge>
                  <span>
                    {execution.operatorName ?? 'Operador'} ·{' '}
                    {execution.machineCode ?? 'Sin máquina'}
                  </span>
                  <span>
                    {formatProductionDateTime(execution.startedAt)}
                    {duration !== null ? ` · ${duration} min` : ''}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {execution.status === 'COMPLETED'
                      ? `${execution.quantityAccepted} OK / ${execution.quantityRejected} rechazadas`
                      : execution.status === 'CANCELLED'
                        ? execution.cancellationReason ?? 'Cancelada'
                        : 'En curso'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </article>
  )
}
