import {
  WORK_ORDER_PRIORITIES,
  WORK_ORDER_STATUSES,
  type WorkOrderFiltersValue,
  type WorkOrderPriority,
  type WorkOrderStatus,
} from '../types/workOrder.types'
import {
  getWorkOrderPriorityLabel,
  getWorkOrderStatusPresentation,
} from '../model/workOrderPresenter'

interface WorkOrderFiltersProps {
  value: WorkOrderFiltersValue
  onChange: (value: WorkOrderFiltersValue) => void
}

export function WorkOrderFilters({ value, onChange }: WorkOrderFiltersProps) {
  const update = <K extends keyof WorkOrderFiltersValue>(
    key: K,
    nextValue: WorkOrderFiltersValue[K],
  ) => onChange({ ...value, [key]: nextValue })

  return (
    <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[minmax(260px,1fr)_220px_180px]">
      <label className="block">
        <span className="sr-only">Buscar órdenes de trabajo</span>
        <input
          type="search"
          value={value.search}
          onChange={(event) => update('search', event.target.value)}
          placeholder="Buscar por OT, expediente, solicitud o cliente"
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="sr-only">Filtrar por estado</span>
        <select
          value={value.status}
          onChange={(event) =>
            update('status', event.target.value as WorkOrderStatus | 'ALL')
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos los estados</option>
          {WORK_ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getWorkOrderStatusPresentation(status).label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="sr-only">Filtrar por prioridad</span>
        <select
          value={value.priority}
          onChange={(event) =>
            update('priority', event.target.value as WorkOrderPriority | 'ALL')
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todas las prioridades</option>
          {WORK_ORDER_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {getWorkOrderPriorityLabel(priority)}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
