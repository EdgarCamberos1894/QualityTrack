import type { BadgeProps } from '@/shared/components/ui/Badge'
import type { QuotationDto, QuotationStatus } from '../types/quotation.types'

interface StatusPresentation {
  label: string
  tone: BadgeProps['tone']
}

const statusPresentation: Record<QuotationStatus, StatusPresentation> = {
  DRAFT: { label: 'Borrador', tone: 'neutral' },
  SENT: { label: 'Enviada', tone: 'info' },
  APPROVED: { label: 'Aprobada', tone: 'success' },
  REJECTED: { label: 'Rechazada', tone: 'danger' },
  SUPERSEDED: { label: 'Reemplazada', tone: 'neutral' },
  EXPIRED: { label: 'Vencida', tone: 'warning' },
  CANCELLED: { label: 'Cancelada', tone: 'danger' },
}

export function getQuotationStatusPresentation(
  status: QuotationStatus,
): StatusPresentation {
  return statusPresentation[status]
}

export function formatQuotationMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}

export function formatQuotationDate(value: string | null): string {
  if (!value) return 'Sin definir'

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
  }).format(new Date(year, month - 1, day))
}

export function matchesQuotationSearch(
  quotation: QuotationDto,
  search: string,
): boolean {
  const normalized = search.trim().toLocaleLowerCase('es-MX')

  if (!normalized) return true

  return [
    quotation.quotationNumber,
    quotation.caseNumber,
    quotation.requestNumber,
    quotation.customerName,
    quotation.createdByName ?? '',
  ].some((value) => value.toLocaleLowerCase('es-MX').includes(normalized))
}
