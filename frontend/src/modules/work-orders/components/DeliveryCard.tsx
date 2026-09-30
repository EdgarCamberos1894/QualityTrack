import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  formatDeliveryDateTime,
  getDeliveryAddress,
  getDeliveryStatusPresentation,
} from '../model/deliveryPresenter'
import type { DeliveryDto } from '../types/delivery.types'

interface DeliveryCardProps {
  delivery: DeliveryDto
  canManage: boolean
  onDispatch: () => void
  onComplete: () => void
  onEvidence: () => void
  onCancel: () => void
}

export function DeliveryCard({
  delivery,
  canManage,
  onDispatch,
  onComplete,
  onEvidence,
  onCancel,
}: DeliveryCardProps) {
  const status = getDeliveryStatusPresentation(delivery.status)
  const mutable =
    delivery.status === 'PENDING' || delivery.status === 'DISPATCHED'

  return (
    <article
      id={`delivery-${delivery.id}`}
      className="scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm target:ring-2 target:ring-blue-300"
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">
              Entrega #{delivery.id}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-slate-950">
              {delivery.quantity} piezas · {delivery.deliveryMethod}
            </h3>
            <p className="mt-1 text-[10px] text-slate-500">
              Creada {formatDeliveryDateTime(delivery.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status.tone}>{status.label}</Badge>
            {delivery.evidenceDocumentVersionId ? (
              <Badge tone="success">Evidencia vinculada</Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 px-3 py-3">
            <p className="text-[9px] text-slate-500">Destinatario</p>
            <p className="mt-1 text-xs font-semibold text-slate-950">
              {delivery.destinationRecipientName}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-3 sm:col-span-2">
            <p className="text-[9px] text-slate-500">Destino snapshot</p>
            <p className="mt-1 text-xs font-semibold text-slate-950">
              {getDeliveryAddress(delivery)}
            </p>
          </div>
        </div>

        {delivery.status !== 'PENDING' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Despacho
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-700">
                {formatDeliveryDateTime(delivery.dispatchedAt)}
                {delivery.carrier ? ` · ${delivery.carrier}` : ''}
                {delivery.trackingNumber
                  ? ` · Tracking ${delivery.trackingNumber}`
                  : ''}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Recepción
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-700">
                {delivery.status === 'DELIVERED'
                  ? `${formatDeliveryDateTime(delivery.deliveredAt)} · ${delivery.receivedByName ?? 'Sin receptor'}`
                  : 'Pendiente de recepción'}
              </p>
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-800">
            Preparada y lista para salir de planta. La OT todavía permanece
            READY_FOR_DELIVERY.
          </p>
        )}

        {delivery.status === 'CANCELLED' ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-[10px] leading-5 text-red-800">
            Cancelada {formatDeliveryDateTime(delivery.cancelledAt)} ·{' '}
            {delivery.cancellationReason ?? 'Sin motivo registrado'}
          </p>
        ) : null}

        {canManage && mutable ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <Button size="sm" variant="secondary" onClick={onEvidence}>
              {delivery.evidenceDocumentVersionId
                ? 'Actualizar evidencia'
                : 'Agregar evidencia'}
            </Button>

            <Button size="sm" variant="danger" onClick={onCancel}>
              Cancelar
            </Button>

            {delivery.status === 'PENDING' ? (
              <Button size="sm" onClick={onDispatch}>
                Despachar
              </Button>
            ) : (
              <Button size="sm" onClick={onComplete}>
                Registrar entrega
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  )
}
