from pathlib import Path
import json

section_path = Path('frontend/src/modules/work-orders/components/WorkOrderProduction.tsx')
source = section_path.read_text(encoding='utf-8')

source = source.replace(
    "import { ProductionBlocker } from './ProductionBlocker'\n",
    "import { ProductionBlocker } from './ProductionBlocker'\nimport { ProductionRoutePanel } from './ProductionRoutePanel'\n",
)
source = source.replace("import { ProductionRouteList } from './ProductionRouteList'\n", '')
source = source.replace("import { RoutingFlowView } from './RoutingFlowView'\n", '')
source = source.replace(
    "import { useProductionMutations } from '../hooks/useProductionMutations'\n",
    "import { useProductionHashSelection } from '../hooks/useProductionHashSelection'\nimport { useProductionMutations } from '../hooks/useProductionMutations'\n",
)
source = source.replace(
    "import { formatProductionDateTime } from '../model/productionPresenter'\n",
    "import { getProductionDependencyIds } from '../model/productionPresenter'\n",
)
source = source.replace(
    '''function dependencyIds(operation: RoutingOperationDto) {\n  return operation.prerequisiteOperationIds ?? []\n}\n\n''',
    '',
)
source = source.replace('dependencyIds(', 'getProductionDependencyIds(')

hash_effect = '''  useEffect(() => {\n    const executionMatch = location.hash.match(/^#operation-execution-(\\d+)$/)\n\n    if (executionMatch) {\n      const executionId = Number(executionMatch[1])\n      const execution = productionExecutions.find(\n        (item) => item.id === executionId,\n      )\n\n      if (execution) {\n        setSelectedOperationId(execution.routingOperationId)\n        setExpandedOperationId(execution.routingOperationId)\n      }\n      return\n    }\n\n    const operationMatch = location.hash.match(/^#routing-operation-(\\d+)$/)\n\n    if (operationMatch) {\n      setSelectedOperationId(Number(operationMatch[1]))\n      return\n    }\n\n    if (location.hash.startsWith('#material-lot-')) {\n      setMaterialsOpen(true)\n    }\n  }, [location.hash, productionExecutions])\n\n'''
source = source.replace(hash_effect, '')
source = source.replace(
    "  const latestConsumption = data.materials.at(-1)\n\n",
    '''  const latestConsumption = data.materials.at(-1)\n\n  useProductionHashSelection({\n    hash: location.hash,\n    executions: productionExecutions,\n    setSelectedOperationId,\n    setExpandedOperationId,\n    setMaterialsOpen,\n  })\n\n''',
)

route_start_marker = '''        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">'''
aside_marker = '''        <aside className="flex h-full flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">'''
route_start = source.index(route_start_marker)
aside_start = source.index(aside_marker, route_start)
route_block = source[route_start:aside_start].rstrip()

route_panel_usage = '''        <ProductionRoutePanel
          actualStartAt={data.production.actualStartAt}
          actualEndAt={data.production.actualEndAt}
          operations={operations}
          executions={productionExecutions}
          routingReleased={routingReleased === true}
          selectedOperationId={selectedOperation?.id ?? null}
          expandedOperationId={expandedOperationId}
          completedOperations={completedOperations}
          totalOperations={totalOperations}
          progress={progress}
          routeView={routeView}
          hasProductionRouting={Boolean(productionRouting)}
          onRouteViewChange={setRouteView}
          onSelect={setSelectedOperationId}
          onToggleAttempts={(operationId) =>
            setExpandedOperationId((current) =>
              current === operationId ? null : operationId,
            )
          }
        />'''

source = source.replace(route_block, route_panel_usage)
section_path.write_text(source, encoding='utf-8')

panel_content = '''import { ProductionBlocker } from './ProductionBlocker'
import { ProductionRouteList } from './ProductionRouteList'
import { RoutingFlowView } from './RoutingFlowView'
import { formatProductionDateTime } from '../model/productionPresenter'
import type {
  OperationExecutionDto,
  RoutingOperationDto,
} from '../types/workOrder.types'

type ProductionRouteView = 'flow' | 'list'

interface ProductionRoutePanelProps {
  actualStartAt: string | null
  actualEndAt: string | null
  operations: RoutingOperationDto[]
  executions: OperationExecutionDto[]
  routingReleased: boolean
  selectedOperationId: number | null
  expandedOperationId: number | null
  completedOperations: number
  totalOperations: number
  progress: number
  routeView: ProductionRouteView
  hasProductionRouting: boolean
  onRouteViewChange: (view: ProductionRouteView) => void
  onSelect: (operationId: number) => void
  onToggleAttempts: (operationId: number) => void
}

export function ProductionRoutePanel({
  actualStartAt,
  actualEndAt,
  operations,
  executions,
  routingReleased,
  selectedOperationId,
  expandedOperationId,
  completedOperations,
  totalOperations,
  progress,
  routeView,
  hasProductionRouting,
  onRouteViewChange,
  onSelect,
  onToggleAttempts,
}: ProductionRoutePanelProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Ejecución de producción
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Ruta activa de fabricación
            </h2>
            <p className="mt-1 text-[8px] leading-4 text-slate-500">
              Las ramas pueden avanzar en paralelo cuando sus dependencias estén completas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-right">
            <div>
              <p className="text-[7px] text-slate-400">Inicio real</p>
              <p className="mt-0.5 text-[8px] font-semibold text-slate-800">
                {formatProductionDateTime(actualStartAt)}
              </p>
            </div>
            <div>
              <p className="text-[7px] text-slate-400">Fin real</p>
              <p className="mt-0.5 text-[8px] font-semibold text-slate-800">
                {formatProductionDateTime(actualEndAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between gap-3 text-[8px] text-slate-500">
            <span>Progreso de operaciones</span>
            <span className="font-semibold text-slate-800">
              {completedOperations}/{totalOperations} · {progress}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {operations.length > 0 ? (
        <div>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2">
            <p className="text-[7px] text-slate-400">
              Selecciona una operación para ver sus acciones y estado.
            </p>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => onRouteViewChange('flow')}
                className={
                  routeView === 'flow'
                    ? 'rounded-md bg-white px-2.5 py-1.5 text-[7.5px] font-semibold text-blue-700 shadow-sm'
                    : 'rounded-md px-2.5 py-1.5 text-[7.5px] font-semibold text-slate-500'
                }
              >
                Flujo
              </button>
              <button
                type="button"
                onClick={() => onRouteViewChange('list')}
                className={
                  routeView === 'list'
                    ? 'rounded-md bg-white px-2.5 py-1.5 text-[7.5px] font-semibold text-blue-700 shadow-sm'
                    : 'rounded-md px-2.5 py-1.5 text-[7.5px] font-semibold text-slate-500'
                }
              >
                Lista
              </button>
            </div>
          </div>

          {routeView === 'flow' ? (
            <div className="p-3">
              <RoutingFlowView
                operations={operations}
                executions={executions}
                routingReleased={routingReleased}
                selectedOperationId={selectedOperationId}
                onSelect={onSelect}
              />
            </div>
          ) : (
            <ProductionRouteList
              operations={operations}
              executions={executions}
              routingReleased={routingReleased}
              selectedOperationId={selectedOperationId}
              expandedOperationId={expandedOperationId}
              onSelect={onSelect}
              onToggleAttempts={onToggleAttempts}
            />
          )}
        </div>
      ) : hasProductionRouting ? (
        <div className="p-4">
          <ProductionBlocker text="La hoja de ruta no contiene operaciones ejecutables." />
        </div>
      ) : null}
    </section>
  )
}
'''
Path('frontend/src/modules/work-orders/components/ProductionRoutePanel.tsx').write_text(panel_content, encoding='utf-8')

hash_hook_content = '''import { useEffect } from 'react'
import type { OperationExecutionDto } from '../types/workOrder.types'

interface ProductionHashSelectionParams {
  hash: string
  executions: OperationExecutionDto[]
  setSelectedOperationId: (operationId: number) => void
  setExpandedOperationId: (operationId: number) => void
  setMaterialsOpen: (open: boolean) => void
}

export function useProductionHashSelection({
  hash,
  executions,
  setSelectedOperationId,
  setExpandedOperationId,
  setMaterialsOpen,
}: ProductionHashSelectionParams) {
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const executionMatch = hash.match(/^#operation-execution-(\\d+)$/)

      if (executionMatch) {
        const executionId = Number(executionMatch[1])
        const execution = executions.find((item) => item.id === executionId)

        if (execution) {
          setSelectedOperationId(execution.routingOperationId)
          setExpandedOperationId(execution.routingOperationId)
        }
        return
      }

      const operationMatch = hash.match(/^#routing-operation-(\\d+)$/)

      if (operationMatch) {
        setSelectedOperationId(Number(operationMatch[1]))
        return
      }

      if (hash.startsWith('#material-lot-')) {
        setMaterialsOpen(true)
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [
    executions,
    hash,
    setExpandedOperationId,
    setMaterialsOpen,
    setSelectedOperationId,
  ])
}
'''
Path('frontend/src/modules/work-orders/hooks/useProductionHashSelection.ts').write_text(
    hash_hook_content,
    encoding='utf-8',
)

presenter_path = Path('frontend/src/modules/work-orders/model/productionPresenter.ts')
presenter = presenter_path.read_text(encoding='utf-8')
presenter = presenter.replace(
    '''import type {\n  OperationExecutionDto,\n  OperationExecutionStatus,\n} from '../types/workOrder.types'\n''',
    '''import type {\n  OperationExecutionDto,\n  OperationExecutionStatus,\n  RoutingOperationDto,\n} from '../types/workOrder.types'\n''',
)
if 'export function getProductionDependencyIds' not in presenter:
    presenter = presenter.rstrip() + '''\n\nexport function getProductionDependencyIds(\n  operation: RoutingOperationDto,\n): number[] {\n  return operation.prerequisiteOperationIds ?? []\n}\n'''
presenter_path.write_text(presenter, encoding='utf-8')

baseline_path = Path('frontend/scripts/architecture-baseline.json')
baseline = json.loads(baseline_path.read_text(encoding='utf-8'))
baseline.pop('modules/work-orders/components/WorkOrderProduction.tsx', None)
baseline_path.write_text(json.dumps(baseline, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
