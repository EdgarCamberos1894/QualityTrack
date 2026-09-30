import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { MachineDto } from '@/modules/machines'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  startOperationExecutionSchema,
  type StartOperationExecutionFormValues,
} from '../schemas/production.schemas'
import type { RoutingOperationDto } from '../types/workOrder.types'

interface StartOperationDialogProps {
  open: boolean
  operation: RoutingOperationDto | null
  operatorLabel: string
  machines: MachineDto[]
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: StartOperationExecutionFormValues) => Promise<boolean>
}

export function StartOperationDialog({
  open,
  operation,
  operatorLabel,
  machines,
  submitting,
  error,
  onClose,
  onSubmit,
}: StartOperationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StartOperationExecutionFormValues>({
    resolver: zodResolver(startOperationExecutionSchema),
    defaultValues: {
      machineId: '',
      startNotes: '',
    },
  })

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  if (!open || !operation) return null

  const availableMachines = machines.filter(
    (machine) => machine.status === 'AVAILABLE',
  )

  const close = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) reset()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-operation-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            Iniciar operación
          </p>
          <h2
            id="start-operation-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            {operation.code} · {operation.name}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            La ejecución comenzará ahora y quedará registrada como un nuevo
            intento.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:grid-cols-2">
            <div>
              <p className="text-[9px] text-slate-500">Operador</p>
              <p className="mt-1 text-xs font-semibold text-slate-950">
                {operatorLabel}
              </p>
              <p className="mt-1 text-[9px] text-slate-500">
                Se usará el usuario PRODUCTION autenticado.
              </p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500">Estimado de routing</p>
              <p className="mt-1 text-xs font-semibold text-slate-950">
                {operation.estimatedMinutes} min
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="execution-machine"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Máquina
            </label>
            <select
              id="execution-machine"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              {...register('machineId')}
            >
              <option value="">Sin máquina asignada</option>
              {availableMachines.map((machine) => (
                <option key={machine.id} value={String(machine.id)}>
                  {machine.code} · {machine.name} · {machine.type}
                </option>
              ))}
            </select>
            {availableMachines.length === 0 ? (
              <p className="mt-1.5 text-xs text-amber-700">
                No hay máquinas disponibles. La operación puede iniciarse sin
                una máquina si el proceso lo permite.
              </p>
            ) : null}
          </div>

          <TextareaField
            label="Notas de inicio"
            maxLength={2000}
            placeholder="Condiciones iniciales, preparación o indicaciones de turno…"
            error={errors.startNotes?.message}
            {...register('startNotes')}
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Iniciando…' : 'Iniciar operación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
