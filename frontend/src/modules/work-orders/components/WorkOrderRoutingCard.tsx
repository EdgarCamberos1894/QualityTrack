import { useMemo, useState } from 'react'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import type {
  RoutingOperationDto,
  RoutingSheetDto,
  WorkOrderStatus,
} from '../types/workOrder.types'
import type {
  ReopenRoutingFormValues,
  RoutingOperationFormValues,
} from '../schemas/workOrderPreparation.schemas'
import { ReopenRoutingDialog } from './ReopenRoutingDialog'
import { RoutingOperationDialog } from './RoutingOperationDialog'
import { RoutingOperationsList } from './RoutingOperationsList'

interface PendingState {
  create: boolean
  operation: boolean
  approve: boolean
  reopen: boolean
  release: boolean
}

interface WorkOrderRoutingCardProps {
  routing?: RoutingSheetDto
  workOrderStatus: WorkOrderStatus
  pinnedDocumentCount: number
  canDesign: boolean
  pending: PendingState
  error: unknown
  onCreate: () => Promise<void>
  onAdd: (values: RoutingOperationFormValues) => Promise<boolean>
  onUpdate: (
    operationId: number,
    values: RoutingOperationFormValues,
  ) => Promise<boolean>
  onRemove: (operationId: number) => Promise<void>
  onApprove: () => Promise<void>
  onReopen: (values: ReopenRoutingFormValues) => Promise<boolean>
  onRelease: () => Promise<void>
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

export function WorkOrderRoutingCard({
  routing,
  workOrderStatus,
  pinnedDocumentCount,
  canDesign,
  pending,
  error,
  onCreate,
  onAdd,
  onUpdate,
  onRemove,
  onApprove,
  onReopen,
  onRelease,
}: WorkOrderRoutingCardProps) {
  const [operation, setOperation] = useState<RoutingOperationDto | null>(null)
  const [operationDialogOpen, setOperationDialogOpen] = useState(false)
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false)

  const nextSequence = useMemo(() => {
    if (!routing || routing.operations.length === 0) return 1
    return (
      Math.max(...routing.operations.map((item) => item.sequenceNumber)) + 1
    )
  }, [routing])

  const openCreateOperation = () => {
    setOperation(null)
    setOperationDialogOpen(true)
  }

  const openEditOperation = (item: RoutingOperationDto) => {
    setOperation(item)
    setOperationDialogOpen(true)
  }

  if (!routing) {
    const canCreate =
      canDesign && workOrderStatus === 'CREATED' && pinnedDocumentCount > 0

    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
          03 · Hoja de ruta
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">
              Ruta de producción
            </h2>
            <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-500">
              Define las operaciones técnicas que deberán ejecutarse. Máquina,
              operador y tiempos reales se registran posteriormente.
            </p>
          </div>

          {canCreate ? (
            <Button onClick={() => void onCreate()} disabled={pending.create}>
              {pending.create ? 'Creando ruta…' : 'Crear hoja de ruta'}
            </Button>
          ) : null}
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-xs text-slate-600">
          {pinnedDocumentCount === 0
            ? 'Fija al menos una versión documental para habilitar la hoja de ruta.'
            : !canDesign
              ? 'Solo ENGINEERING o ADMIN pueden diseñar la hoja de ruta.'
              : workOrderStatus !== 'CREATED'
                ? 'La hoja de ruta de producción solo puede crearse mientras la OT está En preparación.'
                : 'La orden ya está lista para crear su ruta de producción.'}
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {getErrorMessage(error)}
          </p>
        ) : null}
      </section>
    )
  }

  const editable = routing.status === 'DRAFT' && canDesign
  const canApprove =
    editable && routing.operations.length > 0 && pinnedDocumentCount > 0
  const canRelease =
    routing.status === 'APPROVED' && canDesign && workOrderStatus === 'CREATED'

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            03 · Hoja de ruta
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-950">
              Ruta de producción · Rev {routing.revision}
            </h2>
            <Badge tone={statusTone[routing.status]}>
              {statusLabel[routing.status]}
            </Badge>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            {routing.operations.length} operaciones ·{' '}
            {routing.totalEstimatedMinutes} min estimados
          </p>
        </div>

        {editable ? (
          <Button size="sm" onClick={openCreateOperation}>
            Agregar operación
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {getErrorMessage(error)}
        </p>
      ) : null}

      <div className="mt-5">
        <RoutingOperationsList
          operations={routing.operations}
          editable={editable}
          removing={pending.operation}
          onEdit={openEditOperation}
          onRemove={onRemove}
        />
      </div>

      {routing.status === 'DRAFT' ? (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-950">
              Revisión en preparación
            </p>
            <p className="mt-1 text-[10px] text-amber-800">
              Aprobar congela las operaciones y las versiones documentales
              fijadas.
            </p>
          </div>
          {canDesign ? (
            <Button
              size="sm"
              disabled={!canApprove || pending.approve}
              onClick={() => void onApprove()}
            >
              {pending.approve ? 'Aprobando…' : 'Aprobar hoja de ruta'}
            </Button>
          ) : null}
        </div>
      ) : null}

      {routing.status === 'APPROVED' ? (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-950">Ruta aprobada</p>
            <p className="mt-1 text-[10px] leading-5 text-blue-800">
              Liberarla la vuelve histórica y mueve la OT a Lista para
              producción. Si necesita corrección, reábrela primero.
            </p>
          </div>
          {canDesign ? (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={pending.reopen}
                onClick={() => setReopenDialogOpen(true)}
              >
                Reabrir
              </Button>
              <Button
                size="sm"
                disabled={!canRelease || pending.release}
                onClick={() => void onRelease()}
              >
                {pending.release ? 'Liberando…' : 'Liberar a producción'}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {routing.status === 'RELEASED' ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-semibold text-emerald-900">
            Ruta liberada e histórica
          </p>
          <p className="mt-1 text-[10px] text-emerald-800">
            Esta revisión ya no puede modificarse ni reabrirse.
          </p>
        </div>
      ) : null}

      <RoutingOperationDialog
        open={operationDialogOpen}
        operation={operation ?? undefined}
        nextSequence={nextSequence}
        submitting={pending.operation}
        error={error}
        onClose={() => {
          setOperationDialogOpen(false)
          setOperation(null)
        }}
        onSubmit={async (values) => {
          const success = operation
            ? await onUpdate(operation.id, values)
            : await onAdd(values)

          if (success) {
            setOperationDialogOpen(false)
            setOperation(null)
          }
          return success
        }}
      />

      <ReopenRoutingDialog
        open={reopenDialogOpen}
        submitting={pending.reopen}
        error={error}
        onClose={() => setReopenDialogOpen(false)}
        onSubmit={async (values) => {
          const success = await onReopen(values)
          if (success) setReopenDialogOpen(false)
          return success
        }}
      />
    </section>
  )
}
