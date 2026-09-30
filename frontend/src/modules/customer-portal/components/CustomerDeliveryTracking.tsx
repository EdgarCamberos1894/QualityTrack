import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import {
  formatCustomerDeliveryDateTime,
  getCustomerDeliveryAddress,
  getCustomerDeliveryStatusPresentation,
  getCustomerDeliverySummary,
} from '../model/customerDeliveryPresenter'
import type { CustomerDeliveryDto } from '../types/customerDelivery.types'

interface CustomerDeliveryTrackingProps {
  deliveries: CustomerDeliveryDto[] | undefined
  requestedQuantity: number
  pending: boolean
  error: unknown
}

function DeliveryCard({ delivery }: { delivery: CustomerDeliveryDto }) {
  const status = getCustomerDeliveryStatusPresentation(delivery.status)

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            Entrega #{delivery.id} · {delivery.workOrderNumber}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-slate-950">
            {delivery.quantity} pieza{delivery.quantity === 1 ? '' : 's'}
          </h3>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <dt className="text-[9px] text-slate-500">Método</dt>
          <dd className="mt-1 text-[11px] font-semibold text-slate-900">
            {delivery.deliveryMethod}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <dt className="text-[9px] text-slate-500">Destinatario</dt>
          <dd className="mt-1 text-[11px] font-semibold text-slate-900">
            {delivery.destinationRecipientName}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
          <dt className="text-[9px] text-slate-500">Destino</dt>
          <dd className="mt-1 text-[11px] font-semibold text-slate-900">
            {getCustomerDeliveryAddress(delivery)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            Despacho
          </p>
          <p className="mt-1 text-[10px] leading-5 text-slate-700">
            {formatCustomerDeliveryDateTime(delivery.dispatchedAt)}
            {delivery.carrier ? ` · ${delivery.carrier}` : ''}
            {delivery.trackingNumber
              ? ` · Guía ${delivery.trackingNumber}`
              : ''}
          </p>
        </div>

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            Entrega
          </p>
          {delivery.status === 'DELIVERED' ? (
            <p className="mt-1 text-[10px] leading-5 text-slate-700">
              {formatCustomerDeliveryDateTime(delivery.deliveredAt)}
              {delivery.receivedByName
                ? ` · Recibió ${delivery.receivedByName}`
                : ''}
            </p>
          ) : delivery.status === 'CANCELLED' ? (
            <p className="mt-1 text-[10px] text-red-700">
              El despacho fue cancelado por logística.
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-blue-700">
              En tránsito. El estado se actualiza cuando logística registra la
              entrega.
            </p>
          )}
        </div>
      </div>

      {delivery.evidenceDocumentVersionId ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] text-emerald-800">
          Evidencia de entrega registrada por logística.
        </p>
      ) : null}
    </article>
  )
}

export function CustomerDeliveryTracking({
  deliveries,
  requestedQuantity,
  pending,
  error,
}: CustomerDeliveryTrackingProps) {
  if (pending) {
    return (
      <Card className="p-5">
        <LoadingState label="Consultando entregas…" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-5">
        <ErrorState error={error} title="No pudimos consultar las entregas" />
      </Card>
    )
  }

  if (!deliveries || deliveries.length === 0) return null

  const summary = getCustomerDeliverySummary(deliveries, requestedQuantity)

  return (
    <section className="space-y-4">
      <div
        className={
          summary.hasInTransit
            ? 'rounded-xl border border-blue-200 bg-blue-50 p-5'
            : summary.completedAgainstRequestedQuantity
              ? 'rounded-xl border border-emerald-200 bg-emerald-50 p-5'
              : 'rounded-xl border border-slate-200 bg-white p-5'
        }
      >
        <p
          className={
            summary.hasInTransit
              ? 'text-[9px] font-semibold uppercase tracking-wide text-blue-700'
              : summary.completedAgainstRequestedQuantity
                ? 'text-[9px] font-semibold uppercase tracking-wide text-emerald-700'
                : 'text-[9px] font-semibold uppercase tracking-wide text-slate-500'
          }
        >
          {summary.hasInTransit
            ? 'Entrega en camino'
            : summary.completedAgainstRequestedQuantity
              ? 'Entrega completada'
              : 'Entregas registradas'}
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-950">
          {summary.hasInTransit
            ? `${summary.dispatchedQuantity} pieza${summary.dispatchedQuantity === 1 ? '' : 's'} actualmente en tránsito.`
            : summary.completedAgainstRequestedQuantity
              ? `${summary.deliveredQuantity} de ${requestedQuantity} piezas solicitadas figuran como entregadas.`
              : `${summary.deliveredQuantity} de ${requestedQuantity} piezas solicitadas figuran como entregadas.`}
        </p>

        <p className="mt-2 text-[10px] leading-5 text-slate-600">
          El cliente no confirma manualmente la recepción. QualityTrack refleja
          el estado registrado por el equipo de logística al realizar la
          entrega.
        </p>
      </div>

      <div className="space-y-3">
        {deliveries.map((delivery) => (
          <DeliveryCard key={delivery.id} delivery={delivery} />
        ))}
      </div>
    </section>
  )
}
