import { useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import type { RoutingOperationDto } from '../types/workOrder.types'

interface RoutingOperationsListProps {
  operations: RoutingOperationDto[]
  editable: boolean
  removing: boolean
  onEdit: (operation: RoutingOperationDto) => void
  onRemove: (operationId: number) => Promise<void>
}

export function RoutingOperationsList({
  operations,
  editable,
  removing,
  onEdit,
  onRemove,
}: RoutingOperationsListProps) {
  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(null)

  if (operations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
        <p className="text-xs font-semibold text-slate-800">
          Ruta sin operaciones
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          Agrega al menos una operación antes de aprobar.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {operations.map((item) => (
        <article
          key={item.id}
          className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-800">
                {item.sequenceNumber}
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                  {item.code}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-950">
                  {item.name}
                </p>
                {item.instructions ? (
                  <p className="mt-1 text-[10px] leading-5 text-slate-600">
                    {item.instructions}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 text-[9px] font-semibold text-slate-600">
                {item.estimatedMinutes} min
              </span>

              {editable ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(item)}
                  >
                    Editar
                  </Button>

                  {deleteCandidateId === item.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={removing}
                        onClick={() => {
                          void onRemove(item.id)
                          setDeleteCandidateId(null)
                        }}
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteCandidateId(null)}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteCandidateId(item.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
