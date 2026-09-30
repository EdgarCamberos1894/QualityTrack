import { useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Card } from '@/shared/components/ui/Card'
import { JobCaseFilters } from '../components/JobCaseFilters'
import { JobCaseTable } from '../components/JobCaseTable'
import { useJobCases } from '../hooks/useJobCases'
import { matchesJobCaseSearch } from '../model/jobCasePresenter'
import type { JobCaseFiltersValue } from '../types/jobCase.types'

const initialFilters: JobCaseFiltersValue = {
  search: '',
  status: 'ALL',
  assignment: 'ALL',
}

export function JobCasesPage() {
  const query = useJobCases()
  const [filters, setFilters] = useState<JobCaseFiltersValue>(initialFilters)

  const visibleJobCases = useMemo(() => {
    const jobCases = query.data ?? []

    return jobCases.filter((jobCase) => {
      const assignmentMatches =
        filters.assignment === 'ALL' ||
        (filters.assignment === 'ASSIGNED' &&
          jobCase.assignedToUserId !== null) ||
        (filters.assignment === 'UNASSIGNED' &&
          jobCase.assignedToUserId === null)

      return (
        matchesJobCaseSearch(jobCase, filters.search) &&
        (filters.status === 'ALL' || jobCase.status === filters.status) &&
        assignmentMatches
      )
    })
  }, [filters, query.data])

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando expedientes…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={query.error}
          title="No pudimos cargar los expedientes"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Revisión interna"
        title="Expedientes"
        description="Consulta el ciclo completo de los expedientes, desde la revisión inicial hasta su cierre."
      />

      <Card className="overflow-hidden">
        <div className="px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-950">
            Bandeja de trabajo
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">
            {query.data.length} expedientes · {visibleJobCases.length} visibles
          </p>
        </div>

        <JobCaseFilters value={filters} onChange={setFilters} />

        {visibleJobCases.length > 0 ? (
          <JobCaseTable jobCases={visibleJobCases} />
        ) : (
          <div className="p-5">
            <EmptyState
              title="No hay expedientes que coincidan"
              description="Ajusta la búsqueda o los filtros para consultar otros expedientes."
            />
          </div>
        )}
      </Card>
    </PageContainer>
  )
}
