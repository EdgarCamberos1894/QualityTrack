import type { BadgeProps } from '@/shared/components/ui/Badge'
import type {
  CustomerRequestStatus,
  CustomerRequestSummaryDto,
} from '../types/customerRequest.types'

interface RequestStatusPresentation {
  label: string
  stage: string
  tone: BadgeProps['tone']
}

const statuses: Record<CustomerRequestStatus, RequestStatusPresentation> = {
  SUBMITTED: {
    label: 'Recibida',
    stage: 'Revisión',
    tone: 'warning',
  },
  UNDER_REVIEW: {
    label: 'En revisión',
    stage: 'Revisión',
    tone: 'warning',
  },
  WAITING_CUSTOMER_INFO: {
    label: 'Esperando información',
    stage: 'Revisión',
    tone: 'warning',
  },
  READY_FOR_QUOTATION: {
    label: 'Lista para cotización',
    stage: 'Cotización',
    tone: 'info',
  },
  IN_PRODUCTION: {
    label: 'En producción',
    stage: 'Producción',
    tone: 'info',
  },
  CANCELLED: {
    label: 'Cancelada',
    stage: 'Cancelada',
    tone: 'danger',
  },
}

export function getCustomerRequestStatusPresentation(
  status: CustomerRequestStatus,
): RequestStatusPresentation {
  return statuses[status]
}

export function requestNeedsCustomerResponse(
  request: CustomerRequestSummaryDto,
): boolean {
  return request.jobCase.status === 'WAITING_CUSTOMER_INFO'
}

export function canCancelCustomerRequest(
  request: CustomerRequestSummaryDto,
): boolean {
  return ['SUBMITTED', 'UNDER_REVIEW', 'WAITING_CUSTOMER_INFO'].includes(
    request.jobCase.status,
  )
}

export function canModifyCustomerRequestDocuments(
  request: CustomerRequestSummaryDto,
): boolean {
  return !['READY_FOR_QUOTATION', 'IN_PRODUCTION', 'CANCELLED'].includes(
    request.jobCase.status,
  )
}

export function formatCustomerRequestDate(value: string | null): string {
  if (!value) return 'Sin fecha requerida'

  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
  }).format(date)
}

export function formatCustomerRequestDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
