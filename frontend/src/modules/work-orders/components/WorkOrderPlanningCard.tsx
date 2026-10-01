import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  workOrderPlanningSchema,
  type WorkOrderPlanningFormValues,
} from '../schemas/workOrderPreparation.schemas'
import {
  formatWorkOrderDate,
  getWorkOrderPriorityLabel,
} from '../model/workOrderPresenter'
import type { WorkOrderDetailDto } from '../types/workOrder.types'

interface WorkOrderPlanningCardProps {
  workOrder: WorkOrderDetailDto
  canEdit: boolean
  saving: boolean
  error: unknown
  onSave: (values: WorkOrderPlanningFormValues) => Promise<boolean>
}

export function WorkOrderPlanningCard({
  workOrder,
  canEdit,
  saving,
  error,
  onSave,
}: WorkOrderPlanningCardProps) {
  const [editing, setEditing] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkOrderPlanningFormValues>({
    resolver: zodResolver(workOrderPlanningSchema),
    defaultValues: {
      priority: workOrder.priority,
      plannedStartDate: workOrder.plannedStartDate ?? '',
      plannedEndDate: workOrder.plannedEndDate ?? '',
    },
  })

  useEffect(() => {
    reset({
      priority: workOrder.priority,
      plannedStartDate: workOrder.plannedStartDate ?? '',
      plannedEndDate: workOrder.plannedEndDate ?? '',
    })
  }, [reset, workOrder])

  const submit = handleSubmit(async (values) => {
    setDateError(null)

    if (values.plannedStartDate > values.plannedEndDate) {
      setDateError(
        'La fecha de inicio no puede ser posterior a la fecha de fin.',
      )
      return
    }

    if (
      workOrder.agreedDeliveryDate &&
      values.plannedEndDate >= workOrder.agreedDeliveryDate
    ) {
      setDateError(
        'La fabricación debe terminar antes de la entrega comprometida.',
      )
      return
    }

    if (await onSave(values)) {
      setEditing(false)
    }
  })

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-violet-700">
            01 · Planificación
          </p>
          <h2 className="mt-1 text-sm font-semibold text-slate-950">
            Parámetros operativos
          </h2>
          <p className="mt-1 text-[10px] text-slate-500">
            Cantidad, prioridad y fechas que guían la preparación de la orden.
          </p>
        </div>

        {canEdit && !editing ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setEditing(true)}
          >
            Editar planificación
          </Button>
        ) : null}
      </div>

      {editing ? (
        <form
          className="mt-5 grid gap-4 @4xl/page:grid-cols-3"
          onSubmit={(event) => void submit(event)}
        >
          <div>
            <label
              htmlFor="planning-priority"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Prioridad
            </label>
            <select
              id="planning-priority"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              {...register('priority')}
            >
              <option value="LOW">Baja</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
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

          {dateError ? (
            <p className="@4xl/page:col-span-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {dateError}
            </p>
          ) : null}

          {error ? (
            <p className="@4xl/page:col-span-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 @4xl/page:col-span-3">
            <Button
              variant="secondary"
              onClick={() => {
                reset()
                setDateError(null)
                setEditing(false)
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar planificación'}
            </Button>
          </div>
        </form>
      ) : (
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 @4xl/page:grid-cols-5">
          <div>
            <dt className="text-[9px] text-slate-500">Cantidad planeada</dt>
            <dd className="mt-1 text-xs font-semibold text-slate-950">
              {workOrder.plannedQuantity ?? 'Sin definir'}
            </dd>
          </div>
          <div>
            <dt className="text-[9px] text-slate-500">Prioridad</dt>
            <dd className="mt-1 text-xs font-semibold text-slate-950">
              {getWorkOrderPriorityLabel(workOrder.priority)}
            </dd>
          </div>
          <div>
            <dt className="text-[9px] text-slate-500">Inicio planeado</dt>
            <dd className="mt-1 text-xs font-semibold text-slate-950">
              {formatWorkOrderDate(workOrder.plannedStartDate)}
            </dd>
          </div>
          <div>
            <dt className="text-[9px] text-slate-500">Fin planeado</dt>
            <dd className="mt-1 text-xs font-semibold text-slate-950">
              {formatWorkOrderDate(workOrder.plannedEndDate)}
            </dd>
          </div>
          <div>
            <dt className="text-[9px] text-slate-500">Entrega comprometida</dt>
            <dd className="mt-1 text-xs font-semibold text-slate-950">
              {formatWorkOrderDate(workOrder.agreedDeliveryDate)}
            </dd>
          </div>
        </dl>
      )}
    </section>
  )
}
