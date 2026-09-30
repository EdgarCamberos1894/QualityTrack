import type { WorkOrderStatus } from '../types/workOrder.types'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useQualityMutations } from '../hooks/useQualityMutations'

interface QualityHandoffPanelProps {
  workOrderId: number
  workOrderStatus: WorkOrderStatus
  productionCompleted: boolean
  canHandoff: boolean
}

export function QualityHandoffPanel({
  workOrderId,
  workOrderStatus,
  productionCompleted,
  canHandoff,
}: QualityHandoffPanelProps) {
  const mutations = useQualityMutations(workOrderId)

  if (!productionCompleted) return null

  if (workOrderStatus !== 'IN_PRODUCTION') {
    return (
      <section className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-5 py-4">
        <p className="text-xs font-semibold text-emerald-950">
          Handoff de Calidad registrado
        </p>
        <p className="mt-1 text-[10px] leading-5 text-emerald-800">
          La producción original quedó cerrada y el flujo formal de inspección
          ya fue creado. Los resultados de Calidad se gestionan desde su
          pestaña.
        </p>
      </section>
    )
  }

  const handoff = async () => {
    mutations.handoff.reset()

    try {
      await mutations.handoff.mutateAsync()
    } catch {
      // El error se presenta dentro del panel.
    }
  }

  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-950">
            Producción completada · lista para Calidad
          </p>
          <p className="mt-1 max-w-2xl text-[10px] leading-5 text-blue-800">
            Este paso es explícito: crea una inspección PENDING y mueve la orden
            a QUALITY_PENDING. Los rechazos de producción no sustituyen la
            inspección formal.
          </p>
        </div>

        {canHandoff ? (
          <Button
            onClick={() => void handoff()}
            disabled={mutations.handoff.isPending}
            className="shrink-0"
          >
            {mutations.handoff.isPending ? 'Enviando…' : 'Enviar a Calidad'}
          </Button>
        ) : null}
      </div>

      {!canHandoff ? (
        <p className="mt-3 text-[10px] font-medium text-blue-800">
          Solo PRODUCTION o ADMIN pueden realizar el handoff.
        </p>
      ) : null}

      {mutations.handoff.error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {getErrorMessage(mutations.handoff.error)}
        </p>
      ) : null}
    </section>
  )
}
