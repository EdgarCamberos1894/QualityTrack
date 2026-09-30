import { useState } from 'react'
import {
  useMaterialLots,
  useMaterialMutations,
  type MaterialDto,
} from '@/modules/materials'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { formatResourceDate } from '../model/resourcePresenter'
import type { CreateMaterialLotFormValues } from '../schemas/resource.schemas'
import { CreateMaterialLotDialog } from './CreateMaterialLotDialog'

interface MaterialLotsPanelProps {
  material: MaterialDto | null
  canManage: boolean
}

export function MaterialLotsPanel({
  material,
  canManage,
}: MaterialLotsPanelProps) {
  const lotsQuery = useMaterialLots(material?.id ?? null)
  const mutations = useMaterialMutations()
  const [createOpen, setCreateOpen] = useState(false)

  if (!material) {
    return (
      <Card className="overflow-hidden">
        <div className="p-5">
          <EmptyState
            title="Selecciona un material"
            description="Aquí verás sus lotes, proveedor, fecha de recepción y cantidad recibida."
          />
        </div>
      </Card>
    )
  }

  const createLot = async (values: CreateMaterialLotFormValues) => {
    try {
      await mutations.createLot.mutateAsync({
        materialId: material.id,
        payload: {
          lotNumber: values.lotNumber.trim(),
          supplier: values.supplier.trim() || undefined,
          receivedAt: values.receivedAt
            ? new Date(values.receivedAt).toISOString()
            : undefined,
          quantityReceived: values.quantityReceived,
        },
      })
      return true
    } catch {
      return false
    }
  }

  const lots = lotsQuery.data ?? []

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            {material.code}
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            {material.name}
          </h2>
          <p className="mt-1 text-[10px] leading-5 text-slate-500">
            Unidad: {material.unit}
            {material.specification
              ? ' · ' + material.specification
              : ''}
          </p>
          {!lotsQuery.isPending && !lotsQuery.isError ? (
            <p className="mt-2 text-[9px] font-semibold text-slate-400">
              {lots.length}{' '}
              {lots.length === 1 ? 'lote registrado' : 'lotes registrados'}
            </p>
          ) : null}
        </div>

        {canManage ? (
          <Button
            size="sm"
            onClick={() => {
              mutations.createLot.reset()
              setCreateOpen(true)
            }}
          >
            Registrar lote
          </Button>
        ) : null}
      </div>

      {lotsQuery.isPending ? (
        <div className="p-5">
          <LoadingState label="Cargando lotes…" />
        </div>
      ) : lotsQuery.isError ? (
        <div className="p-5">
          <ErrorState
            error={lotsQuery.error}
            title="No pudimos cargar los lotes"
          />
        </div>
      ) : lots.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="Sin lotes registrados"
            description="Registra una recepción para que el material pueda utilizarse con trazabilidad en producción."
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {lots.map((lot) => (
            <article
              key={lot.id}
              className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(160px,1fr)_minmax(160px,1fr)_150px_120px] md:items-center"
            >
              <div>
                <p className="text-xs font-semibold text-slate-950">
                  {lot.lotNumber}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  {lot.supplier ?? 'Proveedor no especificado'}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-wide text-slate-400">
                  Recepción
                </p>
                <p className="mt-1 text-[10px] text-slate-700">
                  {formatResourceDate(lot.receivedAt)}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-wide text-slate-400">
                  Cantidad recibida
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-950">
                  {lot.quantityReceived} {material.unit}
                </p>
              </div>

              <div className="md:text-right">
                {lot.certificateDocumentVersionId ? (
                  <Badge tone="success">Certificado</Badge>
                ) : (
                  <Badge tone="neutral">Sin certificado</Badge>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <CreateMaterialLotDialog
        material={createOpen ? material : null}
        submitting={mutations.createLot.isPending}
        error={mutations.createLot.error}
        onClose={() => {
          mutations.createLot.reset()
          setCreateOpen(false)
        }}
        onSubmit={createLot}
      />
    </Card>
  )
}
