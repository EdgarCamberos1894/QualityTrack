import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  useMaterialLots,
  useMaterials,
  type RecordMaterialConsumptionPayload,
} from '@/modules/materials'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  materialConsumptionSchema,
  type MaterialConsumptionFormValues,
} from '../schemas/production.schemas'
import type { WorkOrder360MaterialDto } from '../types/workOrder360.types'

interface ProductionMaterialsCardProps {
  consumptions: WorkOrder360MaterialDto[]
  canRecord: boolean
  submitting: boolean
  error: unknown
  onRecord: (
    payload: RecordMaterialConsumptionPayload,
  ) => Promise<boolean>
}

export function ProductionMaterialsCard({
  consumptions,
  canRecord,
  submitting,
  error,
  onRecord,
}: ProductionMaterialsCardProps) {
  const materialsQuery = useMaterials(canRecord)
  const [materialId, setMaterialId] = useState<number | null>(null)
  const [lotId, setLotId] = useState<number | null>(null)
  const lotsQuery = useMaterialLots(canRecord ? materialId : null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaterialConsumptionFormValues>({
    resolver: zodResolver(materialConsumptionSchema),
    defaultValues: { quantityUsed: 0.001 },
  })

  const submit = handleSubmit(async (values) => {
    if (lotId === null) return

    if (
      await onRecord({
        materialLotId: lotId,
        quantityUsed: values.quantityUsed,
      })
    ) {
      reset({ quantityUsed: 0.001 })
    }
  })

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
          Materiales
        </p>
        <h2 className="mt-1 text-sm font-semibold text-slate-950">
          Consumo real por lote
        </h2>
        <p className="mt-1 text-[10px] leading-5 text-slate-500">
          Registra únicamente material realmente consumido. El consumo se
          acumula por OT + lote.
        </p>
      </div>

      {canRecord ? (
        <form
          className="mt-5 grid gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 lg:grid-cols-[1fr_1fr_180px_auto]"
          onSubmit={(event) => void submit(event)}
        >
          <div>
            <label
              htmlFor="production-material"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Material
            </label>
            <select
              id="production-material"
              value={materialId ?? ''}
              disabled={materialsQuery.isPending || submitting}
              onChange={(event) => {
                setMaterialId(
                  event.target.value ? Number(event.target.value) : null,
                )
                setLotId(null)
              }}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Seleccionar material</option>
              {(materialsQuery.data ?? []).map((material) => (
                <option key={material.id} value={material.id}>
                  {material.code} · {material.name} · {material.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="production-lot"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Lote
            </label>
            <select
              id="production-lot"
              value={lotId ?? ''}
              disabled={materialId === null || lotsQuery.isPending || submitting}
              onChange={(event) =>
                setLotId(event.target.value ? Number(event.target.value) : null)
              }
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
            >
              <option value="">Seleccionar lote</option>
              {(lotsQuery.data ?? []).map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.lotNumber} · recibido {lot.quantityReceived}
                </option>
              ))}
            </select>
          </div>

          <TextField
            label="Cantidad usada"
            type="number"
            min="0.001"
            step="0.001"
            error={errors.quantityUsed?.message}
            {...register('quantityUsed', { valueAsNumber: true })}
          />

          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full"
              disabled={lotId === null || submitting}
            >
              {submitting ? 'Registrando…' : 'Registrar consumo'}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] leading-5 text-slate-600">
          El consumo solo puede registrarse mientras la producción está en
          ejecución y por un usuario PRODUCTION o ADMIN.
        </p>
      )}

      {materialsQuery.isError || lotsQuery.isError ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          No pudimos cargar el catálogo de materiales o lotes.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {getErrorMessage(error)}
        </p>
      ) : null}

      <div className="mt-5">
        {consumptions.length === 0 ? (
          <EmptyState
            title="Sin consumo registrado"
            description="Todavía no se han asociado lotes de material a esta orden."
          />
        ) : (
          <div className="grid gap-2">
            {consumptions.map(({ consumption, lot }) => (
              <article
                key={consumption.id}
                className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-[10px] sm:grid-cols-[1fr_1fr_auto]"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {consumption.materialCode} · {consumption.materialName}
                  </p>
                  <p className="mt-1 text-slate-500">
                    Lote {consumption.lotNumber}
                    {lot.supplier ? ` · ${lot.supplier}` : ''}
                  </p>
                </div>
                <div className="text-slate-600">
                  Registrado por{' '}
                  {consumption.recordedByName ?? 'usuario de producción'}
                </div>
                <div className="font-semibold text-slate-950">
                  {consumption.quantityUsed} {consumption.unit}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
