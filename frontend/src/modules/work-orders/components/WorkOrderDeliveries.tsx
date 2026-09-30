import { useMemo, useState } from 'react'
import { useSessionStore } from '@/modules/auth'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { CancelDeliveryDialog } from './CancelDeliveryDialog'
import {
  CompleteDeliveryDialog,
  type DeliveryEvidenceOption,
} from './CompleteDeliveryDialog'
import { CreateDeliveryDialog } from './CreateDeliveryDialog'
import { DeliveryCard } from './DeliveryCard'
import { DeliveryEvidenceDialog } from './DeliveryEvidenceDialog'
import { DispatchDeliveryDialog } from './DispatchDeliveryDialog'
import { useDeliveryMutations } from '../hooks/useDeliveryMutations'
import {
  getAvailableDeliveryQuantity,
  getDeliveredQuantity,
  getReservedQuantity,
} from '../model/deliveryPresenter'
import type {
  AttachDeliveryEvidenceFormValues,
  CancelDeliveryFormValues,
  CompleteDeliveryFormValues,
  CreateDeliveryFormValues,
  DispatchDeliveryFormValues,
} from '../schemas/delivery.schemas'
import type { DeliveryDto } from '../types/delivery.types'
import type { WorkOrder360Dto } from '../types/workOrder360.types'

interface WorkOrderDeliveriesProps {
  data: WorkOrder360Dto
}

type DialogType = 'dispatch' | 'complete' | 'evidence' | 'cancel' | null

export function WorkOrderDeliveries({ data }: WorkOrderDeliveriesProps) {
  const session = useSessionStore((state) => state.session)
  const roles = session?.user.roles ?? []
  const canManage = roles.includes('ADMIN') || roles.includes('LOGISTICS')
  const mutations = useDeliveryMutations()
  const [createOpen, setCreateOpen] = useState(false)
  const [target, setTarget] = useState<DeliveryDto | null>(null)
  const [dialog, setDialog] = useState<DialogType>(null)

  const deliveries = useMemo(
    () =>
      [...data.deliveries].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime(),
      ),
    [data.deliveries],
  )

  const evidenceOptions = useMemo<DeliveryEvidenceOption[]>(
    () =>
      data.documents
        .filter((entry) => entry.document.documentType === 'DELIVERY_EVIDENCE')
        .flatMap((entry) =>
          entry.versions.map((version) => ({
            id: version.id,
            label: `${entry.document.name} · v${version.version} · ${version.fileName}`,
          })),
        ),
    [data.documents],
  )

  const plannedQuantity = data.workOrder.plannedQuantity
  const reservedQuantity = getReservedQuantity(deliveries)
  const deliveredQuantity = getDeliveredQuantity(deliveries)
  const availableQuantity = getAvailableDeliveryQuantity(
    plannedQuantity,
    deliveries,
  )
  const canCreate =
    canManage &&
    data.workOrder.status === 'READY_FOR_DELIVERY' &&
    availableQuantity > 0

  const actionError =
    mutations.create.error ??
    mutations.dispatch.error ??
    mutations.complete.error ??
    mutations.uploadEvidence.error ??
    mutations.attachEvidence.error ??
    mutations.cancel.error

  const create = async (values: CreateDeliveryFormValues) => {
    try {
      await mutations.create.mutateAsync({
        workOrderId: data.workOrder.id,
        payload: {
          quantity: values.quantity,
          destinationRecipientName: values.destinationRecipientName.trim(),
          destinationAddress: values.destinationAddress.trim(),
          destinationCity: values.destinationCity.trim(),
          destinationState: values.destinationState.trim(),
          destinationPostalCode: values.destinationPostalCode.trim(),
          destinationCountry: values.destinationCountry.trim(),
          deliveryMethod: values.deliveryMethod.trim(),
        },
      })
      return true
    } catch {
      return false
    }
  }

  const dispatch = async (values: DispatchDeliveryFormValues) => {
    if (!target) return false

    try {
      await mutations.dispatch.mutateAsync({
        deliveryId: target.id,
        payload: {
          ...(values.carrier.trim() ? { carrier: values.carrier.trim() } : {}),
          ...(values.trackingNumber.trim()
            ? { trackingNumber: values.trackingNumber.trim() }
            : {}),
        },
      })
      setTarget(null)
      setDialog(null)
      return true
    } catch {
      return false
    }
  }

  const complete = async (values: CompleteDeliveryFormValues) => {
    if (!target) return false

    try {
      await mutations.complete.mutateAsync({
        deliveryId: target.id,
        payload: {
          receivedByName: values.receivedByName.trim(),
          deliveredAt: new Date(values.deliveredAt).toISOString(),
          ...(values.evidenceDocumentVersionId
            ? {
                evidenceDocumentVersionId: Number(
                  values.evidenceDocumentVersionId,
                ),
              }
            : {}),
        },
      })
      setTarget(null)
      setDialog(null)
      return true
    } catch {
      return false
    }
  }

  const uploadEvidence = async (file: File) => {
    if (!target) return false

    try {
      await mutations.uploadEvidence.mutateAsync({
        deliveryId: target.id,
        file,
      })
      setTarget(null)
      setDialog(null)
      return true
    } catch {
      return false
    }
  }

  const attachEvidence = async (values: AttachDeliveryEvidenceFormValues) => {
    if (!target) return false

    try {
      await mutations.attachEvidence.mutateAsync({
        deliveryId: target.id,
        payload: { documentVersionId: Number(values.documentVersionId) },
      })
      setTarget(null)
      setDialog(null)
      return true
    } catch {
      return false
    }
  }

  const cancel = async (values: CancelDeliveryFormValues) => {
    if (!target) return false

    try {
      await mutations.cancel.mutateAsync({
        deliveryId: target.id,
        payload: { reason: values.reason.trim() },
      })
      setTarget(null)
      setDialog(null)
      return true
    } catch {
      return false
    }
  }

  const openDialog = (delivery: DeliveryDto, type: DialogType) => {
    mutations.dispatch.reset()
    mutations.complete.reset()
    mutations.uploadEvidence.reset()
    mutations.attachEvidence.reset()
    mutations.cancel.reset()
    setTarget(delivery)
    setDialog(type)
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-blue-200 bg-blue-50/60 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">
              Logística
            </p>
            <h2 className="mt-1 text-base font-semibold text-slate-950">
              Entregas parciales y cierre de la OT
            </h2>
            <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-600">
              Preparar una entrega reserva cantidad. La OT solo pasa a DELIVERED
              cuando el acumulado efectivamente recibido cubre planned_quantity.
            </p>
          </div>

          {canCreate ? (
            <Button onClick={() => setCreateOpen(true)}>
              Preparar entrega
            </Button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white px-3 py-3">
            <p className="text-[9px] text-slate-500">Disponibles</p>
            <p className="mt-1 text-sm font-bold text-slate-950">
              {availableQuantity} / {plannedQuantity ?? 0}
            </p>
          </div>
          <div className="rounded-lg bg-white px-3 py-3">
            <p className="text-[9px] text-slate-500">Reservadas activas</p>
            <p className="mt-1 text-sm font-bold text-slate-950">
              {reservedQuantity}
            </p>
          </div>
          <div className="rounded-lg bg-white px-3 py-3">
            <p className="text-[9px] text-slate-500">Recibidas acumuladas</p>
            <p className="mt-1 text-sm font-bold text-emerald-700">
              {deliveredQuantity} / {plannedQuantity ?? 0}
            </p>
          </div>
        </div>
      </section>

      {!canManage ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] text-slate-600">
          Las entregas son de solo lectura para tu rol. Solo LOGISTICS o ADMIN
          pueden prepararlas, despacharlas, cancelarlas y registrar recepción.
        </p>
      ) : null}

      {data.workOrder.status !== 'READY_FOR_DELIVERY' &&
      data.workOrder.status !== 'DELIVERED' ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[10px] leading-5 text-amber-800">
          La OT debe estar READY_FOR_DELIVERY para gestionar entregas.
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {getErrorMessage(actionError)}
        </p>
      ) : null}

      {deliveries.length === 0 ? (
        <EmptyState
          title="Sin entregas"
          description="Cuando la OT esté lista, LOGISTICS puede preparar el primer despacho."
        />
      ) : (
        <div className="space-y-3">
          {deliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              canManage={canManage}
              onDispatch={() => openDialog(delivery, 'dispatch')}
              onComplete={() => openDialog(delivery, 'complete')}
              onEvidence={() => openDialog(delivery, 'evidence')}
              onCancel={() => openDialog(delivery, 'cancel')}
            />
          ))}
        </div>
      )}

      {data.workOrder.status === 'DELIVERED' ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[10px] font-semibold text-emerald-800">
          <Badge tone="success">DELIVERED</Badge>
          La cantidad recibida acumulada cubrió la cantidad planificada y la OT
          quedó cerrada.
        </div>
      ) : null}

      <CreateDeliveryDialog
        open={createOpen}
        availableQuantity={availableQuantity}
        submitting={mutations.create.isPending}
        error={mutations.create.error}
        onClose={() => {
          mutations.create.reset()
          setCreateOpen(false)
        }}
        onSubmit={create}
      />

      <DispatchDeliveryDialog
        delivery={dialog === 'dispatch' ? target : null}
        submitting={mutations.dispatch.isPending}
        error={mutations.dispatch.error}
        onClose={() => {
          mutations.dispatch.reset()
          setTarget(null)
          setDialog(null)
        }}
        onSubmit={dispatch}
      />

      <CompleteDeliveryDialog
        delivery={dialog === 'complete' ? target : null}
        evidenceOptions={evidenceOptions}
        submitting={mutations.complete.isPending}
        error={mutations.complete.error}
        onClose={() => {
          mutations.complete.reset()
          setTarget(null)
          setDialog(null)
        }}
        onSubmit={complete}
      />

      <DeliveryEvidenceDialog
        delivery={dialog === 'evidence' ? target : null}
        options={evidenceOptions}
        submitting={mutations.attachEvidence.isPending}
        uploading={mutations.uploadEvidence.isPending}
        error={mutations.attachEvidence.error}
        uploadError={mutations.uploadEvidence.error}
        onClose={() => {
          mutations.uploadEvidence.reset()
          mutations.attachEvidence.reset()
          setTarget(null)
          setDialog(null)
        }}
        onSubmit={attachEvidence}
        onUpload={uploadEvidence}
      />

      <CancelDeliveryDialog
        delivery={dialog === 'cancel' ? target : null}
        submitting={mutations.cancel.isPending}
        error={mutations.cancel.error}
        onClose={() => {
          mutations.cancel.reset()
          setTarget(null)
          setDialog(null)
        }}
        onSubmit={cancel}
      />
    </div>
  )
}
