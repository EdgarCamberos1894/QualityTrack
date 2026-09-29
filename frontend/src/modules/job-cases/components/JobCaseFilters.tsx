import {
  JOB_CASE_STATUSES,
  type JobCaseFiltersValue,
  type JobCaseStatus,
} from '../types/jobCase.types'
import { getJobCaseStatusPresentation } from '../model/jobCasePresenter'

interface JobCaseFiltersProps {
  value: JobCaseFiltersValue
  onChange: (value: JobCaseFiltersValue) => void
}

export function JobCaseFilters({ value, onChange }: JobCaseFiltersProps) {
  const update = <K extends keyof JobCaseFiltersValue>(
    key: K,
    nextValue: JobCaseFiltersValue[K],
  ) => onChange({ ...value, [key]: nextValue })

  return (
    <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-[minmax(260px,1fr)_220px_180px]">
      <label className="block">
        <span className="sr-only">Buscar expedientes</span>
        <input
          type="search"
          value={value.search}
          onChange={(event) => update('search', event.target.value)}
          placeholder="Buscar por expediente, solicitud, cliente o título"
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="sr-only">Filtrar por estado</span>
        <select
          value={value.status}
          onChange={(event) =>
            update('status', event.target.value as JobCaseStatus | 'ALL')
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos los estados</option>
          {JOB_CASE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getJobCaseStatusPresentation(status).label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="sr-only">Filtrar por asignación</span>
        <select
          value={value.assignment}
          onChange={(event) =>
            update(
              'assignment',
              event.target.value as JobCaseFiltersValue['assignment'],
            )
          }
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos</option>
          <option value="UNASSIGNED">Sin asignar</option>
          <option value="ASSIGNED">Asignados</option>
        </select>
      </label>
    </div>
  )
}
