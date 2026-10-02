import type { BadgeProps } from '@/shared/components/ui/Badge'
import type {
  CaseInformationRequestDto,
  JobCaseDetailDto,
  JobCaseDto,
  JobCaseStatus,
} from '../types/jobCase.types'

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
  COMPLETED: { label: 'Completado', tone: 'success' },
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

export function formatJobCaseDateTime(value: string | null): string {
  if (!value) return 'Sin registrar'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatJobCaseFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`
}

export function getJobCaseClarificationSummary(
  requests: CaseInformationRequestDto[],
): string {
  if (requests.length === 0) return 'Sin aclaraciones'

  const pending = requests.filter((request) => request.open).length
  const resolved = requests.length - pending

  if (pending > 0 && resolved > 0) {
    return `${pending} pendiente${pending === 1 ? '' : 's'} · ${resolved} resuelta${resolved === 1 ? '' : 's'}`
  }

  if (pending > 0) {
    return `${pending} pendiente${pending === 1 ? '' : 's'}`
  }

  return `${resolved} resuelta${resolved === 1 ? '' : 's'}`
}

export function getJobCaseMaterialSummary(
  jobCase: JobCaseDetailDto,
): string {
  if (jobCase.materialSpecification) {
    return jobCase.materialSpecification.standardOrGrade
      ? `${jobCase.materialSpecification.materialName} · ${jobCase.materialSpecification.standardOrGrade}`
      : jobCase.materialSpecification.materialName
  }

  if (jobCase.request.materialRequirementType === 'ASSISTANCE_REQUIRED') {
    return 'Pendiente de definición técnica'
  }

  return jobCase.request.materialRequirement
    ? `Cliente · ${jobCase.request.materialRequirement}`
    : 'Definido por el cliente'
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
