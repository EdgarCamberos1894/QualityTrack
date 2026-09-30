import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { formatWorkOrderDate } from '../model/workOrderPresenter'
import {
  createWorkOrderSchema,
  type CreateWorkOrderFormValues,
} from '../schemas/createWorkOrder.schema'

interface CreateWorkOrderDialogProps {
  open: boolean
  quotationNumber: string
  quotationRevision: number
  customerName: string
  plannedQuantity: number
  agreedDeliveryDate: string | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CreateWorkOrderFormValues) => Promise<boolean>
}

const priorityOptions = [
  { value: 'LOW', label: 'Baja' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
] as const

export function CreateWorkOrderDialog({
  open,
  quotationNumber,
  quotationRevision,
  customerName,
  plannedQuantity,
  agreedDeliveryDate,
  submitting,
  error,
  onClose,
  onSubmit,
}: CreateWorkOrderDialogProps) {
  const [planningError, setPlanningError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkOrderFormValues>({
    resolver: zodResolver(createWorkOrderSchema),
    defaultValues: {
      priority: 'NORMAL',
      plannedStartDate: '',
      plannedEndDate: '',
    },
  })

  if (!open) return null

  const close = () => {
    reset()
    setPlanningError(null)
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    setPlanningError(null)

    if (values.plannedStartDate > values.plannedEndDate) {
      setPlanningError(
        'La fecha de inicio no puede ser posterior a la fecha de fin.',
      )
      return
    }

    if (
      agreedDeliveryDate &&
      values.plannedEndDate >= agreedDeliveryDate
    ) {
      setPlanningError(
        'La fabricación debe terminar antes de la fecha comprometida de entrega.',
      )
      return
    }

    if (await onSubmit(values)) {
      reset()
      setPlanningError(null)
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-work-order-title"
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-[9px] font-semibold uppercase tracking-wide text-violet-700">
                Nueva orden de trabajo
              </span>
              <h2
                id="create-work-order-title"
                className="mt-3 text-xl font-semibold text-slate-950"
              >
                Preparar paquete operativo
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Convierte la cotización aprobada en una orden lista para
                preparación técnica.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={close}>
              Cerrar
            </Button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          <section className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-violet-700">
              Compromiso aprobado
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-[9px] text-slate-500">Cotización</p>
                <p className="mt-1 text-xs font-semibold text-slate-950">
                  {quotationNumber} · Rev {quotationRevision}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500">Cliente</p>
                <p className="mt-1 text-xs font-semibold text-slate-950">
                  {customerName}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500">Cantidad planeada</p>
                <p className="mt-1 text-xs font-semibold text-slate-950">
                  {plannedQuantity} piezas
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500">
                  Entrega comprometida
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-950">
                  {formatWorkOrderDate(agreedDeliveryDate)}
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="work-order-priority"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Prioridad
              </label>
              <select
                id="work-order-priority"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                {...register('priority')}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <TextField
              label="Inicio planeado"
              type="date"
              error={errors.plannedStartDate?.message}
              {...register('plannedStartDate')}
            />

            <TextField
              label="Fin planeado"
              type="date"
              error={errors.plannedEndDate?.message}
              {...register('plannedEndDate')}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] leading-5 text-slate-600">
            La cantidad se toma como snapshot de la solicitud. La orden nace en
            <strong className="font-semibold text-slate-900">
              {' '}
              En preparación
            </strong>
            ; documentos, routing y liberación a producción se gestionan
            después.
          </div>

          {planningError ? (
            <p
              role="alert"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"
            >
              {planningError}
            </p>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
            >
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creando orden…' : 'Crear orden de trabajo'}
          </Button>
        </div>
      </form>
    </div>
  )
}
