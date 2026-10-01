import { Badge } from '@/shared/components/ui/Badge'
import { formatProductionDateTime } from '../model/productionPresenter'
import type {
  ProductionStatusDto,
  RoutingSheetDto,
} from '../types/workOrder.types'

interface ProductionProgressHeaderProps {
  production: ProductionStatusDto
  routing?: RoutingSheetDto
  completedOperations: number
}

export function ProductionProgressHeader({
  production,
  routing,
  completedOperations,
}: ProductionProgressHeaderProps) {
  const totalOperations = routing?.operations.length ?? 0
  const progress =
    totalOperations > 0
      ? Math.round((completedOperations / totalOperations) * 100)
      : 0

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
      <div className="flex flex-col gap-5 @3xl/page:flex-row @3xl/page:items-start @3xl/page:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            Producción
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            Ejecución real de planta
          </h2>
          <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-600">
            Registra quién ejecutó cada operación, cuándo ocurrió, qué máquina
            se utilizó y cuál fue el resultado real.
          </p>
        </div>

        <Badge
          tone={
            production.productionCompleted
              ? 'success'
              : production.status === 'IN_PRODUCTION'
                ? 'warning'
                : 'neutral'
          }
          className="px-4 py-1.5"
        >
          {production.productionCompleted
            ? 'Producción completada'
            : production.status === 'IN_PRODUCTION'
              ? 'En producción'
              : 'Pendiente de iniciar'}
        </Badge>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_180px_180px]">
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-600">
            <span>Progreso de operaciones</span>
            <span className="font-semibold text-slate-900">
              {completedOperations}/{totalOperations} · {progress}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-[9px] text-slate-500">Inicio real</p>
          <p className="mt-1 text-[10px] font-semibold text-slate-900">
            {formatProductionDateTime(production.actualStartAt)}
          </p>
        </div>

        <div>
          <p className="text-[9px] text-slate-500">Fin real</p>
          <p className="mt-1 text-[10px] font-semibold text-slate-900">
            {formatProductionDateTime(production.actualEndAt)}
          </p>
        </div>
      </div>
    </section>
  )
}
