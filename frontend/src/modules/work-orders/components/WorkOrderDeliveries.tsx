import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { DeliveryDto } from '../types/workOrder360.types'

interface WorkOrderDeliveriesProps {
  deliveries: DeliveryDto[]
}

const statusPresentation = {
  PENDING: { label: 'Pendiente', tone: 'neutral' },
  DISPATCHED: { label: 'Despachada', tone: 'info' },
  DELIVERED: { label: 'Entregada', tone: 'success' },
  CANCELLED: { label: 'Cancelada', tone: 'danger' },
} as const

export function WorkOrderDeliveries({ deliveries }: WorkOrderDeliveriesProps) {
  if (deliveries.length === 0) {
    return (
      <EmptyState
        title="Sin entregas"
        description="Todavía no hay entregas registradas para esta orden."
      />
    )
  }

  return (
    <div className="grid gap-3">
      {deliveries.map((delivery) => {
        const status = statusPresentation[delivery.status]

        return (
          <article
            key={delivery.id}
            className="rounded-xl border border-[#d9e2ee] bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Entrega #{delivery.id}
                </p>
                <h2 className="mt-1 text-sm font-semibold text-slate-950">
                  {delivery.destinationRecipientName ??
                    'Destinatario sin definir'}
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  Cantidad: {delivery.quantity}
                  {delivery.trackingNumber
                    ? ` · Tracking: ${delivery.trackingNumber}`
                    : ''}
                </p>
              </div>
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
          </article>
        )
      })}
    </div>
  )
}
