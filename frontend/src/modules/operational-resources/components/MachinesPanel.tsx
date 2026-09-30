import { useMemo, useState } from 'react'
import {
  useMachineMutations,
  useMachines,
  type MachineDto,
  type ManageableMachineStatus,
} from '@/modules/machines'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import {
  formatResourceDate,
  getMachineStatusPresentation,
} from '../model/resourcePresenter'
import type { CreateMachineFormValues } from '../schemas/resource.schemas'
import { CreateMachineDialog } from './CreateMachineDialog'
import { MachineStatusDialog } from './MachineStatusDialog'

interface MachinesPanelProps {
  canManage: boolean
}

export function MachinesPanel({ canManage }: MachinesPanelProps) {
  const query = useMachines()
  const mutations = useMachineMutations()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<MachineDto | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    if (!term) return query.data ?? []

    return (query.data ?? []).filter((machine) =>
      [machine.code, machine.name, machine.type ?? ''].some((value) =>
        value.toLocaleLowerCase().includes(term),
      ),
    )
  }, [query.data, search])

  if (query.isPending) {
    return <LoadingState label="Cargando máquinas…" />
  }

  if (query.isError) {
    return (
      <ErrorState error={query.error} title="No pudimos cargar las máquinas" />
    )
  }

  const machines = query.data
  const available = machines.filter(
    (machine) => machine.status === 'AVAILABLE',
  ).length
  const inUse = machines.filter((machine) => machine.status === 'IN_USE').length
  const unavailable = machines.filter(
    (machine) =>
      machine.status === 'MAINTENANCE' ||
      machine.status === 'OUT_OF_SERVICE',
  ).length

  const create = async (values: CreateMachineFormValues) => {
    try {
      await mutations.create.mutateAsync({
        code: values.code.trim(),
        name: values.name.trim(),
        type: values.type.trim() || undefined,
      })
      return true
    } catch {
      return false
    }
  }

  const updateStatus = async (status: ManageableMachineStatus) => {
    if (!statusTarget) return false

    try {
      await mutations.updateStatus.mutateAsync({
        machineId: statusTarget.id,
        payload: { status },
      })
      return true
    } catch {
      return false
    }
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Disponibles</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{available}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">En uso</p>
          <p className="mt-1 text-xl font-bold text-blue-700">{inUse}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">No disponibles</p>
          <p className="mt-1 text-xl font-bold text-amber-700">{unavailable}</p>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">
              Parque de máquinas
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              {machines.length} registradas · {filtered.length} visibles
            </p>
          </div>

          {canManage ? (
            <Button
              size="sm"
              onClick={() => {
                mutations.create.reset()
                setCreateOpen(true)
              }}
            >
              Registrar máquina
            </Button>
          ) : null}
        </div>

        <div className="border-b border-slate-200 p-4">
          <label>
            <span className="sr-only">Buscar máquina</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar código, nombre o tipo"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title={
                machines.length === 0
                  ? 'Sin máquinas registradas'
                  : 'Sin coincidencias'
              }
              description={
                machines.length === 0
                  ? 'Registra el parque de máquinas para poder asignarlo a las ejecuciones de producción.'
                  : 'Prueba con otro código, nombre o tipo.'
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((machine) => {
              const status = getMachineStatusPresentation(machine.status)

              return (
                <article
                  key={machine.id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[170px_minmax(220px,1fr)_190px_150px_120px] lg:items-center"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-950">
                      {machine.code}
                    </p>
                    <p className="mt-1 text-[9px] text-slate-500">
                      Alta {formatResourceDate(machine.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-950">
                      {machine.name}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {machine.type ?? 'Tipo no especificado'}
                    </p>
                  </div>

                  <Badge tone={status.tone}>{status.label}</Badge>

                  <p className="text-[10px] text-slate-500">
                    Actualizada {formatResourceDate(machine.updatedAt)}
                  </p>

                  <div className="lg:text-right">
                    {canManage ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={machine.status === 'IN_USE'}
                        title={
                          machine.status === 'IN_USE'
                            ? 'El estado se libera al finalizar o cancelar la ejecución.'
                            : undefined
                        }
                        onClick={() => {
                          mutations.updateStatus.reset()
                          setStatusTarget(machine)
                        }}
                      >
                        {machine.status === 'IN_USE' ? 'En ejecución' : 'Estado'}
                      </Button>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Solo lectura
                      </span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </Card>

      <CreateMachineDialog
        open={createOpen}
        submitting={mutations.create.isPending}
        error={mutations.create.error}
        onClose={() => {
          mutations.create.reset()
          setCreateOpen(false)
        }}
        onSubmit={create}
      />

      <MachineStatusDialog
        machine={statusTarget}
        submitting={mutations.updateStatus.isPending}
        error={mutations.updateStatus.error}
        onClose={() => {
          mutations.updateStatus.reset()
          setStatusTarget(null)
        }}
        onSubmit={updateStatus}
      />
    </>
  )
}
