import type { BadgeProps } from '@/shared/components/ui/Badge'
import type {
  WorkOrderDto,
  WorkOrderPriority,
  WorkOrderStatus,
} from '../types/workOrder.types'

interface StatusPresentation {
  label: string
  tone: BadgeProps['tone']
}

const statusPresentation: Record<WorkOrderStatus, StatusPresentation> = {
  CREATED: { label: 'En preparación', tone: 'neutral' },
  READY_FOR_PRODUCTION: { label: 'Lista para producción', tone: 'info' },
  IN_PRODUCTION: { label: 'En producción', tone: 'info' },
  QUALITY_PENDING: { label: 'Calidad pendiente', tone: 'warning' },
  QUALITY_HOLD: { label: 'Retenida por calidad', tone: 'warning' },
  REWORK_IN_PROGRESS: { label: 'En retrabajo', tone: 'warning' },
  READY_FOR_DELIVERY: { label: 'Lista para entrega', tone: 'success' },
  DELIVERED: { label: 'Entregada', tone: 'success' },
  CANCELLED: { label: 'Cancelada', tone: 'danger' },
}

const priorityLabels: Record<WorkOrderPriority, string> = {
  LOW: 'Baja',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

export function getWorkOrderStatusPresentation(
  status: WorkOrderStatus,
): StatusPresentation {
  return statusPresentation[status]
}

export function getWorkOrderPriorityLabel(priority: WorkOrderPriority): string {
  return priorityLabels[priority]
}

export function formatWorkOrderDate(value: string | null): string {
  if (!value) return 'Sin definir'

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) return value

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export function matchesWorkOrderSearch(
  workOrder: WorkOrderDto,
  search: string,
): boolean {
  const normalized = search.trim().toLocaleLowerCase('es-MX')

  if (!normalized) return true

  return [
    workOrder.workOrderNumber,
    workOrder.caseNumber,
    workOrder.requestNumber,
    workOrder.customerName,
    workOrder.approvedQuotationNumber,
  ].some((value) => value.toLocaleLowerCase('es-MX').includes(normalized))
}
