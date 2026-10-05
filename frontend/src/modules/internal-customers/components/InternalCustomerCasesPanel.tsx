import { useEffect, useMemo, useState } from 'react'
import {
  JOB_CASE_STATUSES,
  JobCaseTable,
  getJobCaseStatusPresentation,
  type JobCaseStatus,
} from '@/modules/job-cases'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useInternalCustomerJobCases } from '../hooks/useInternalCustomers'
import type {
  InternalCustomerCaseAssignment,
  InternalCustomerJobCaseQuery,
} from '../types/internalCustomer.types'

interface InternalCustomerCasesPanelProps {
  customerId: number
  totalCases: number
}

const PAGE_SIZE = 5
const SEARCH_DELAY_MS = 300

export function InternalCustomerCasesPanel({
  customerId,
  totalCases,
}: InternalCustomerCasesPanelProps) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<JobCaseStatus | 'ALL'>('ALL')
  const [assignment, setAssignment] =
    useState<InternalCustomerCaseAssignment>('ALL')
  const [page, setPage] = useState(0)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(0)
    }, SEARCH_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  const query = useMemo<InternalCustomerJobCaseQuery>(
    () => ({
      page,
      size: PAGE_SIZE,
      search,
      status,
      assignment,
    }),
    [assignment, page, search, status],
  )

  const casesQuery = useInternalCustomerJobCases(customerId, query)
  const result = casesQuery.data
  const visibleCases = result?.items ?? []
  const totalItems = result?.totalItems ?? 0
  const totalPages = result?.totalPages ?? 0
  const hasFilters = search !== '' || status !== 'ALL' || assignment !== 'ALL'

  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) {
      setPage(totalPages - 1)
    }
  }, [page, totalPages])

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setStatus('ALL')
    setAssignment('ALL')
    setPage(0)
  }

  const changeStatus = (value: JobCaseStatus | 'ALL') => {
    setStatus(value)
    setPage(0)
  }

  const changeAssignment = (value: InternalCustomerCaseAssignment) => {
    setAssignment(value)
    setPage(0)
  }

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
      <div className="flex flex-col gap-2.5 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Flujo comercial
          </p>
          <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
            Expedientes de la empresa
          </h2>
          <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
            Consulta solicitudes convertidas en expediente y localiza rápidamente su etapa actual.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[8px] font-semibold text-slate-600 shadow-sm">
            {totalCases} en total
          </span>
          {hasFilters && result ? (
            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[8px] font-semibold text-blue-700">
              {totalItems} coincidencia{totalItems === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>
      </div>

      {totalCases > 0 ? (
        <>
          <div className="grid gap-2 border-b border-slate-200 bg-slate-50/55 px-4 py-2 md:grid-cols-[minmax(260px,1fr)_170px_170px] sm:px-5">
            <label className="relative block">
              <span className="sr-only">Buscar expedientes de esta empresa</span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar expediente, solicitud o proyecto…"
                className="h-8 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-[9px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="sr-only">Filtrar expedientes por estado</span>
              <select
                value={status}
                onChange={(event) =>
                  changeStatus(event.target.value as JobCaseStatus | 'ALL')
                }
                className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-[9px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="ALL">Todos los estados</option>
                {JOB_CASE_STATUSES.map((caseStatus) => (
                  <option key={caseStatus} value={caseStatus}>
                    {getJobCaseStatusPresentation(caseStatus).label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="sr-only">Filtrar expedientes por asignación</span>
              <select
                value={assignment}
                onChange={(event) =>
                  changeAssignment(
                    event.target.value as InternalCustomerCaseAssignment,
                  )
                }
                className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-[9px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="ALL">Todas las asignaciones</option>
                <option value="ASSIGNED">Asignados</option>
                <option value="UNASSIGNED">Sin asignar</option>
              </select>
            </label>
          </div>

          {casesQuery.isError ? (
            <div className="bg-slate-50/30 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-red-800">
                    No pudimos cargar los expedientes.
                  </p>
                  <p role="alert" className="mt-0.5 text-[8px] leading-4 text-red-700">
                    {getErrorMessage(casesQuery.error)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void casesQuery.refetch()}
                  className="inline-flex h-7 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-[8px] font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : casesQuery.isPending && !result ? (
            <div className="bg-slate-50/30 px-4 py-7 text-center sm:px-5">
              <p className="text-[9px] font-medium text-slate-500">
                Cargando expedientes…
              </p>
            </div>
          ) : visibleCases.length > 0 ? (
            <div
              className={`bg-slate-50/20 px-4 py-3 transition-opacity sm:px-5 ${
                casesQuery.isFetching ? 'opacity-60' : 'opacity-100'
              }`}
            >
              <JobCaseTable jobCases={visibleCases} density="compact" />
            </div>
          ) : (
            <div className="bg-slate-50/30 p-4">
              <EmptyState
                title="No hay coincidencias"
                description="Prueba con otro término o limpia los filtros para volver a ver todos los expedientes de esta empresa."
              />
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-7 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[8px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}

          {result && totalItems > 0 ? (
            <div className="flex flex-col gap-2 border-t border-slate-200 bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-[8px] font-medium text-slate-500">
                Mostrando {page * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE + visibleCases.length, totalItems)} de{' '}
                {totalItems} expediente{totalItems === 1 ? '' : 's'}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  disabled={page === 0 || casesQuery.isFetching}
                  className="inline-flex h-7 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[8px] font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="min-w-20 text-center text-[8px] font-semibold text-slate-500">
                  Página {page + 1} de {Math.max(totalPages, 1)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages - 1, current + 1))
                  }
                  disabled={
                    totalPages === 0 || page >= totalPages - 1 || casesQuery.isFetching
                  }
                  className="inline-flex h-7 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[8px] font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="bg-slate-50/30 p-4">
          <EmptyState
            title="Sin expedientes"
            description="Esta empresa todavía no tiene solicitudes convertidas en expediente."
          />
        </div>
      )}
    </section>
  )
}
