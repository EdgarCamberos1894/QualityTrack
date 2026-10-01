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
      className="scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-28px_rgba(15,23,42,0.28)] target:ring-2 target:ring-blue-200"
    >
      <div className="flex flex-col gap-2.5 border-b border-slate-100 px-3.5 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-blue-600">
            Entrega #{delivery.id}
          </p>
          <h3 className="mt-0.5 text-[10px] font-semibold text-slate-950">
            {delivery.quantity} piezas · {delivery.deliveryMethod}
          </h3>
          <p className="mt-0.5 text-[8px] text-slate-400">
            Creada {formatDeliveryDateTime(delivery.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={status.tone} className="px-2 py-0.5 text-[7px]">
            {status.label}
          </Badge>
          {delivery.evidenceDocumentVersionId ? (
            <Badge tone="success" className="px-2 py-0.5 text-[7px]">
              Evidencia vinculada
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="space-y-2.5 px-3.5 py-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50/70 px-3 py-2.5">
            <p className="text-[7px] text-slate-400">Destinatario</p>
            <p className="mt-0.5 text-[9px] font-semibold text-slate-900">
              {delivery.destinationRecipientName}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50/70 px-3 py-2.5 sm:col-span-2">
            <p className="text-[7px] text-slate-400">Destino snapshot</p>
            <p className="mt-0.5 text-[9px] font-semibold text-slate-900">
              {getDeliveryAddress(delivery)}
            </p>
          </div>
        </div>

        {delivery.status !== 'PENDING' ? (
          <div className="grid gap-2 border-t border-slate-100 pt-2.5 sm:grid-cols-2">
            <div>
              <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                Despacho
              </p>
              <p className="mt-0.5 text-[8px] leading-4 text-slate-600">
                {formatDeliveryDateTime(delivery.dispatchedAt)}
                {delivery.carrier ? ` · ${delivery.carrier}` : ''}
                {delivery.trackingNumber
                  ? ` · Tracking ${delivery.trackingNumber}`
                  : ''}
              </p>
            </div>
            <div>
              <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                Recepción
              </p>
              <p className="mt-0.5 text-[8px] leading-4 text-slate-600">
                {delivery.status === 'DELIVERED'
                  ? `${formatDeliveryDateTime(delivery.deliveredAt)} · ${delivery.receivedByName ?? 'Sin receptor'}`
                  : 'Pendiente de recepción'}
              </p>
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-[8px] leading-4 text-amber-800">
            Preparada y lista para salir de planta. La OT permanece lista para entrega.
          </p>
        )}

        {delivery.status === 'CANCELLED' ? (
          <p className="rounded-lg border border-red-200 bg-red-50/70 px-3 py-2 text-[8px] leading-4 text-red-800">
            Cancelada {formatDeliveryDateTime(delivery.cancelledAt)} ·{' '}
            {delivery.cancellationReason ?? 'Sin motivo registrado'}
          </p>
        ) : null}

        {canManage && mutable ? (
          <div className="flex flex-wrap justify-end gap-1.5 border-t border-slate-100 pt-2.5">
            <Button
              size="sm"
              variant="secondary"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onEvidence}
            >
              {delivery.evidenceDocumentVersionId
                ? 'Actualizar evidencia'
                : 'Agregar evidencia'}
            </Button>

            <Button
              size="sm"
              variant="danger"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onCancel}
            >
              Cancelar
            </Button>

            {delivery.status === 'PENDING' ? (
              <Button
                size="sm"
                className="!h-7 !px-2.5 !text-[8px]"
                onClick={onDispatch}
              >
                Despachar
              </Button>
            ) : (
              <Button
                size="sm"
                className="!h-7 !px-2.5 !text-[8px]"
                onClick={onComplete}
              >
                Registrar entrega
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  )
}
