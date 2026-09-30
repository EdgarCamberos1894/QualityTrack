import { useMemo, useState } from 'react'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { ReopenRoutingDialog } from './ReopenRoutingDialog'
import { RoutingOperationDialog } from './RoutingOperationDialog'
import { RoutingOperationsList } from './RoutingOperationsList'
import { useReworkMutations } from '../hooks/useReworkMutations'
import type {
  ReopenRoutingFormValues,
  RoutingOperationFormValues,
} from '../schemas/workOrderPreparation.schemas'
import type {
  RoutingOperationDto,
  RoutingSheetDto,
} from '../types/workOrder.types'

interface ReworkRoutingCardProps {
  routing: RoutingSheetDto
  productionRouting?: RoutingSheetDto
  nonConformityNumber: string
  canDesign: boolean
  active: boolean
}

const statusTone = {
  DRAFT: 'neutral',
  APPROVED: 'warning',
  RELEASED: 'success',
} as const

const statusLabel = {
  DRAFT: 'Borrador',
  APPROVED: 'Aprobada',
  RELEASED: 'Liberada',
} as const

export function ReworkRoutingCard({
  routing,
  productionRouting,
  nonConformityNumber,
  canDesign,
  active,
}: ReworkRoutingCardProps) {
  const mutations = useReworkMutations()
  const [operation, setOperation] = useState<RoutingOperationDto | undefined>()
  const [operationDialogOpen, setOperationDialogOpen] = useState(false)
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false)

  const nextSequence = useMemo(() => {
    if (routing.operations.length === 0) return 1
    return (
      Math.max(...routing.operations.map((item) => item.sequenceNumber)) + 1
    )
  }, [routing.operations])

  const error =
    mutations.addOperation.error ??
    mutations.updateOperation.error ??
    mutations.removeOperation.error ??
    mutations.approveAndRelease.error ??
    mutations.release.error ??
    mutations.reopen.error

  const saveOperation = async (values: RoutingOperationFormValues) => {
    const payload = {
      sequenceNumber: values.sequenceNumber,
      code: values.code.trim(),
      name: values.name.trim(),
      instructions: values.instructions.trim(),
      estimatedMinutes: values.estimatedMinutes,
    }

    try {
      if (operation) {
        await mutations.updateOperation.mutateAsync({
          routingSheetId: routing.id,
          operationId: operation.id,
          payload,
        })
      } else {
        await mutations.addOperation.mutateAsync({
          routingSheetId: routing.id,
          payload,
        })
      }

      setOperationDialogOpen(false)
      setOperation(undefined)
      return true
    } catch {
      return false
    }
  }

  const removeOperation = async (operationId: number) => {
    try {
      await mutations.removeOperation.mutateAsync({
        routingSheetId: routing.id,
        operationId,
      })
    } catch {
      // El error se presenta dentro de la tarjeta.
    }
  }

  const reopen = async (values: ReopenRoutingFormValues) => {
    try {
      await mutations.reopen.mutateAsync({
        routingSheetId: routing.id,
        payload: { reason: values.reason.trim() },
      })
      setReopenDialogOpen(false)
      return true
    } catch {
      return false
    }
  }

  const editable = active && canDesign && routing.status === 'DRAFT'

  return (
    <section
      id={`routing-sheet-${routing.id}`}
      className="scroll-mt-24 rounded-xl border border-amber-200 bg-amber-50/30 p-5 target:ring-2 target:ring-blue-300"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            Ruta de retrabajo · Rev {routing.revision}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-950">
              REWORK · {nonConformityNumber}
            </h3>
            <Badge tone={statusTone[routing.status]}>
              {statusLabel[routing.status]}
            </Badge>
            {!active ? <Badge tone="neutral">Histórica</Badge> : null}
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            {routing.operations.length} operaciones ·{' '}
            {routing.totalEstimatedMinutes} min estimados
          </p>
        </div>

        {editable ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setOperation(undefined)
              setOperationDialogOpen(true)
            }}
          >
            + Agregar operación
          </Button>
        ) : null}
      </div>

      {productionRouting ? (
        <p className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] leading-5 text-slate-600">
          Ruta original preservada: Rev {productionRouting.revision} ·
          PRODUCTION · {productionRouting.status}. Esta revisión REWORK no la
          modifica.
        </p>
      ) : null}

      <div className="mt-4">
        <RoutingOperationsList
          operations={routing.operations}
          editable={editable}
          removing={mutations.removeOperation.isPending}
          onEdit={(selected) => {
            setOperation(selected)
            setOperationDialogOpen(true)
          }}
          onRemove={removeOperation}
        />
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {getErrorMessage(error)}
        </p>
      ) : null}

      {active && canDesign ? (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-amber-200 pt-4">
          {routing.status === 'DRAFT' && routing.operations.length > 0 ? (
            <Button
              onClick={() => mutations.approveAndRelease.mutate(routing.id)}
              disabled={mutations.approveAndRelease.isPending}
            >
              {mutations.approveAndRelease.isPending
                ? 'Aprobando y liberando…'
                : 'Aprobar y liberar ruta'}
            </Button>
          ) : null}

          {routing.status === 'APPROVED' ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setReopenDialogOpen(true)}
              >
                Reabrir
              </Button>
              <Button
                onClick={() => mutations.release.mutate(routing.id)}
                disabled={mutations.release.isPending}
              >
                {mutations.release.isPending ? 'Liberando…' : 'Liberar ruta'}
              </Button>
            </>
          ) : null}
        </div>
      ) : null}

      <RoutingOperationDialog
        open={operationDialogOpen}
        operation={operation}
        nextSequence={nextSequence}
        submitting={
          mutations.addOperation.isPending ||
          mutations.updateOperation.isPending
        }
        error={
          operation
            ? mutations.updateOperation.error
            : mutations.addOperation.error
        }
        onClose={() => {
          mutations.addOperation.reset()
          mutations.updateOperation.reset()
          setOperationDialogOpen(false)
          setOperation(undefined)
        }}
        onSubmit={saveOperation}
      />

      <ReopenRoutingDialog
        open={reopenDialogOpen}
        submitting={mutations.reopen.isPending}
        error={mutations.reopen.error}
        onClose={() => {
          mutations.reopen.reset()
          setReopenDialogOpen(false)
        }}
        onSubmit={reopen}
      />
    </section>
  )
}
