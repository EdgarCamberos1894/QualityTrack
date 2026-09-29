import type { BadgeProps } from '@/shared/components/ui/Badge'
import type { JobCaseDto, JobCaseStatus } from '../types/jobCase.types'

interface StatusPresentation {
  label: string
  tone: BadgeProps['tone']
}

const statusPresentation: Record<JobCaseStatus, StatusPresentation> = {
  SUBMITTED: { label: 'Sin asignar', tone: 'neutral' },
  UNDER_REVIEW: { label: 'En revisión', tone: 'warning' },
  WAITING_CUSTOMER_INFO: {
    label: 'Esperando al cliente',
    tone: 'warning',
  },
  READY_FOR_QUOTATION: { label: 'Listo para cotizar', tone: 'success' },
  IN_PRODUCTION: { label: 'En producción', tone: 'info' },
  CANCELLED: { label: 'Cancelado', tone: 'danger' },
}

export function getJobCaseStatusPresentation(
  status: JobCaseStatus,
): StatusPresentation {
  return statusPresentation[status]
}

export function formatJobCaseDate(value: string | null): string {
  if (!value) return 'Sin definir'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function matchesJobCaseSearch(
  jobCase: JobCaseDto,
  search: string,
): boolean {
  const normalized = search.trim().toLocaleLowerCase('es-MX')

  if (!normalized) return true

  return [
    jobCase.caseNumber,
    jobCase.request.requestNumber,
    jobCase.request.customerName,
    jobCase.request.title,
    jobCase.request.customerReference ?? '',
    jobCase.assignedToName ?? '',
  ].some((value) => value.toLocaleLowerCase('es-MX').includes(normalized))
}
