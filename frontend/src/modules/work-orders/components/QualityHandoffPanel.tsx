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
      <section className="rounded-xl border border-emerald-200 bg-white px-3.5 py-3 shadow-[0_10px_28px_-26px_rgba(5,150,105,0.2)]">
        <p className="text-[9px] font-semibold text-emerald-900">
          Handoff de Calidad registrado
        </p>
        <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
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
    <section className="rounded-xl border border-blue-200 bg-white px-3.5 py-3 shadow-[0_10px_28px_-26px_rgba(37,99,235,0.2)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold text-blue-900">
            Producción completada · lista para Calidad
          </p>
          <p className="mt-0.5 max-w-2xl text-[8px] leading-4 text-slate-500">
            Este paso es explícito: crea una inspección PENDING y mueve la orden
            a QUALITY_PENDING. Los rechazos de producción no sustituyen la
            inspección formal.
          </p>
        </div>

        {canHandoff ? (
          <Button
            onClick={() => void handoff()}
            disabled={mutations.handoff.isPending}
            className="!h-7 shrink-0 !px-2.5 !text-[8px]"
          >
            {mutations.handoff.isPending ? 'Enviando…' : 'Enviar a Calidad'}
          </Button>
        ) : null}
      </div>

      {!canHandoff ? (
        <p className="mt-2 text-[8px] font-medium text-blue-700">
          Solo PRODUCTION o ADMIN pueden realizar el handoff.
        </p>
      ) : null}

      {mutations.handoff.error ? (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
          {getErrorMessage(mutations.handoff.error)}
        </p>
      ) : null}
    </section>
  )
}
