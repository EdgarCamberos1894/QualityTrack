import type { BadgeProps } from '@/shared/components/ui/Badge'
import type { DeliveryDto, DeliveryStatus } from '../types/delivery.types'

interface StatusPresentation {
  label: string
  tone: BadgeProps['tone']
}

const statusPresentation: Record<DeliveryStatus, StatusPresentation> = {
  PENDING: { label: 'Preparada', tone: 'warning' },
  DISPATCHED: { label: 'En tránsito', tone: 'info' },
  DELIVERED: { label: 'Entregada', tone: 'success' },
  CANCELLED: { label: 'Cancelada', tone: 'danger' },
}

export function getDeliveryStatusPresentation(
  status: DeliveryStatus,
): StatusPresentation {
  return statusPresentation[status]
}

export function formatDeliveryDateTime(value: string | null): string {
  if (!value) return 'Sin registrar'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function getDeliveryAddress(delivery: DeliveryDto): string {
  return [
    delivery.destinationAddress,
    delivery.destinationCity,
    delivery.destinationState,
    delivery.destinationPostalCode,
    delivery.destinationCountry,
  ]
    .filter(Boolean)
    .join(', ')
}

export function getReservedQuantity(deliveries: DeliveryDto[]): number {
  return deliveries
    .filter(
      (delivery) =>
        delivery.status === 'PENDING' || delivery.status === 'DISPATCHED',
    )
    .reduce((total, delivery) => total + delivery.quantity, 0)
}

export function getCommittedDeliveryQuantity(
  deliveries: DeliveryDto[],
): number {
  return deliveries
    .filter((delivery) => delivery.status !== 'CANCELLED')
    .reduce((total, delivery) => total + delivery.quantity, 0)
}

export function getDeliveredQuantity(deliveries: DeliveryDto[]): number {
  return deliveries
    .filter((delivery) => delivery.status === 'DELIVERED')
    .reduce((total, delivery) => total + delivery.quantity, 0)
}

export function getAvailableDeliveryQuantity(
  plannedQuantity: number | null,
  deliveries: DeliveryDto[],
): number {
  if (plannedQuantity === null) return 0
  return Math.max(
    plannedQuantity - getCommittedDeliveryQuantity(deliveries),
    0,
  )
}

export function isDeliveredToday(delivery: DeliveryDto): boolean {
  if (delivery.status !== 'DELIVERED' || !delivery.deliveredAt) return false

  const delivered = new Date(delivery.deliveredAt)
  const today = new Date()

  return (
    delivered.getFullYear() === today.getFullYear() &&
    delivered.getMonth() === today.getMonth() &&
    delivered.getDate() === today.getDate()
  )
}


export function formatDeliveryMethod(value: string): string {
  const normalized = value.replaceAll('_', ' ').trim().toLowerCase()

  if (!normalized) return 'Sin método'

  return normalized.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
}
