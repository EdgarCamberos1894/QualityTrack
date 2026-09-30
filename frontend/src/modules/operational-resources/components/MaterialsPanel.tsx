import { useEffect, useMemo, useState } from 'react'
import { useMaterialMutations, useMaterials } from '@/modules/materials'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { cn } from '@/shared/lib/cn'
import type { CreateMaterialFormValues } from '../schemas/resource.schemas'
import { CreateMaterialDialog } from './CreateMaterialDialog'
import { MaterialLotsPanel } from './MaterialLotsPanel'

interface MaterialsPanelProps {
  canManage: boolean
}

export function MaterialsPanel({ canManage }: MaterialsPanelProps) {
  const query = useMaterials()
  const mutations = useMaterialMutations()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const materials = query.data ?? []

  useEffect(() => {
    if (materials.length === 0) {
      setSelectedId(null)
      return
    }

    if (
      !selectedId ||
      !materials.some((material) => material.id === selectedId)
    ) {
      setSelectedId(materials[0].id)
    }
  }, [materials, selectedId])

  const selectedMaterial =
    materials.find((material) => material.id === selectedId) ?? null

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    if (!term) return materials

    return materials.filter((material) =>
      [
        material.code,
        material.name,
        material.specification ?? '',
        material.unit,
      ].some((value) => value.toLocaleLowerCase().includes(term)),
    )
  }, [materials, search])

  if (query.isPending) {
    return <LoadingState label="Cargando materiales…" />
  }

  if (query.isError) {
    return (
      <ErrorState error={query.error} title="No pudimos cargar los materiales" />
    )
  }

  const createMaterial = async (values: CreateMaterialFormValues) => {
    try {
      const created = await mutations.create.mutateAsync({
        code: values.code.trim(),
        name: values.name.trim(),
        specification: values.specification.trim() || undefined,
        unit: values.unit.trim(),
      })
      setSelectedId(created.id)
      return true
    } catch {
      return false
    }
  }

  return (
    <>
      <Card className="mb-5 px-5 py-4">
        <p className="text-[10px] text-slate-500">Referencias de material</p>
        <p className="mt-1 text-xl font-bold text-slate-950">
          {materials.length}
        </p>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="h-fit overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">
                Materiales
              </h2>
              <p className="mt-1 text-[10px] text-slate-500">
                Referencias disponibles para registrar lotes.
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
                Nuevo
              </Button>
            ) : null}
          </div>

          <div className="border-b border-slate-200 p-4">
            <label>
              <span className="sr-only">Buscar material</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar código, nombre o especificación"
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title={
                  materials.length === 0
                    ? 'Sin materiales registrados'
                    : 'Sin coincidencias'
                }
                description={
                  materials.length === 0
                    ? 'Registra una referencia de material antes de capturar sus lotes.'
                    : 'Ajusta la búsqueda para encontrar otra referencia.'
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((material) => (
                <button
                  key={material.id}
                  type="button"
                  onClick={() => setSelectedId(material.id)}
                  className={cn(
                    'w-full px-5 py-4 text-left transition',
                    selectedId === material.id
                      ? 'bg-blue-50'
                      : 'hover:bg-slate-50',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-950">
                        {material.code} · {material.name}
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-slate-500">
                        {material.specification ??
                          'Sin especificación adicional'}
                      </p>
                    </div>
                    <Badge tone="neutral">{material.unit}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <MaterialLotsPanel
          material={selectedMaterial}
          canManage={canManage}
        />
      </div>

      <CreateMaterialDialog
        open={createOpen}
        submitting={mutations.create.isPending}
        error={mutations.create.error}
        onClose={() => {
          mutations.create.reset()
          setCreateOpen(false)
        }}
        onSubmit={createMaterial}
      />
    </>
  )
}
