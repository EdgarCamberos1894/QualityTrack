import { useEffect, useState } from 'react'
import type {
  MachineDto,
  ManageableMachineStatus,
} from '@/modules/machines'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { manageableMachineStatuses } from '../model/resourcePresenter'

interface MachineStatusDialogProps {
  machine: MachineDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (status: ManageableMachineStatus) => Promise<boolean>
}

export function MachineStatusDialog({
  machine,
  submitting,
  error,
  onClose,
  onSubmit,
}: MachineStatusDialogProps) {
  const [status, setStatus] =
    useState<ManageableMachineStatus>('AVAILABLE')

  useEffect(() => {
    if (
      machine?.status === 'AVAILABLE' ||
      machine?.status === 'MAINTENANCE' ||
      machine?.status === 'OUT_OF_SERVICE'
    ) {
      setStatus(machine.status)
    }
  }, [machine])

  if (!machine) return null

  const submit = async () => {
    if (await onSubmit(status)) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="machine-status-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            Recursos / Máquinas
          </p>
          <h2
            id="machine-status-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Estado de {machine.code}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{machine.name}</p>
        </div>

        <div className="space-y-3 px-6 py-5">
          {manageableMachineStatuses.map((option) => (
            <label
              key={option.value}
              className={
                status === option.value
                  ? 'flex cursor-pointer gap-3 rounded-xl border border-blue-500 bg-blue-50 p-4'
                  : 'flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100'
              }
            >
              <input
                type="radio"
                name="machine-status"
                value={option.value}
                checked={status === option.value}
                disabled={submitting}
                onChange={() => setStatus(option.value)}
                className="mt-0.5"
              />
              <span>
                <span className="block text-xs font-semibold text-slate-950">
                  {option.label}
                </span>
                <span className="mt-1 block text-[10px] leading-5 text-slate-500">
                  {option.description}
                </span>
              </span>
            </label>
          ))}

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={submitting || status === machine.status}
          >
            {submitting ? 'Actualizando…' : 'Guardar estado'}
          </Button>
        </div>
      </section>
    </div>
  )
}
