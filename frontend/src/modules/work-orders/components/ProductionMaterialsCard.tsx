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
  onRecord: (payload: RecordMaterialConsumptionPayload) => Promise<boolean>
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
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Materiales
        </p>
        <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
          Consumo real por lote
        </h2>
        <p className="mt-0.5 text-[8px] leading-4 text-slate-400">
          Registra únicamente material realmente consumido por esta OT.
        </p>
      </div>

      {canRecord ? (
        <form
          className="grid gap-3 border-b border-slate-100 bg-slate-50/45 px-4 py-3 lg:grid-cols-[1fr_1fr_150px_auto]"
          onSubmit={(event) => void submit(event)}
        >
          <div>
            <label
              htmlFor="production-material"
              className="mb-1.5 block text-[10px] font-semibold text-slate-800"
            >
              Material
            </label>
            <div className="relative">
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
                className="h-7 w-full appearance-none rounded-lg border border-slate-300 bg-white px-2 pr-7 !text-[8px] !font-normal !leading-none text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">Seleccionar material</option>
                {(materialsQuery.data ?? []).map((material) => (
                  <option
                    key={material.id}
                    value={material.id}
                    className="text-[8px] font-normal"
                  >
                    {material.code} · {material.name} · {material.unit}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
                fill="currentColor"
              >
                <path d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </div>
          </div>

          <div>
            <label
              htmlFor="production-lot"
              className="mb-1.5 block text-[10px] font-semibold text-slate-800"
            >
              Lote
            </label>
            <div className="relative">
              <select
                id="production-lot"
                value={lotId ?? ''}
                disabled={
                  materialId === null || lotsQuery.isPending || submitting
                }
                onChange={(event) =>
                  setLotId(event.target.value ? Number(event.target.value) : null)
                }
                className="h-7 w-full appearance-none rounded-lg border border-slate-300 bg-white px-2 pr-7 !text-[8px] !font-normal !leading-none text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">Seleccionar lote</option>
                {(lotsQuery.data ?? []).map((lot) => (
                  <option
                    key={lot.id}
                    value={lot.id}
                    className="text-[8px] font-normal"
                  >
                    {lot.lotNumber} · recibido {lot.quantityReceived}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
                fill="currentColor"
              >
                <path d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </div>
          </div>

          <TextField
            label="Cantidad usada"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            type="number"
            min="0.001"
            step="0.001"
            error={errors.quantityUsed?.message}
            {...register('quantityUsed', { valueAsNumber: true })}
          />

          <div className="flex items-end">
            <Button
              type="submit"
              className="!h-8 w-full !px-2.5 !text-[8px]"
              disabled={lotId === null || submitting}
            >
              {submitting ? 'Registrando…' : 'Registrar consumo'}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mx-4 my-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[8px] leading-4 text-slate-500">
          El consumo solo puede registrarse durante producción o retrabajo
          activo y por un usuario PRODUCTION o ADMIN.
        </p>
      )}

      {materialsQuery.isError || lotsQuery.isError ? (
        <p className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[8px] leading-4 text-amber-800">
          No pudimos cargar el catálogo de materiales o lotes.
        </p>
      ) : null}

      {error ? (
        <p className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
          {getErrorMessage(error)}
        </p>
      ) : null}

      <div className="p-4">
        {consumptions.length === 0 ? (
          <EmptyState
            title="Sin consumo registrado"
            description="Todavía no se han asociado lotes de material a esta orden."
          />
        ) : (
          <div className="grid gap-2">
            {consumptions.map(({ consumption, lot }) => (
              <article
                id={`material-lot-${lot.id}`}
                key={consumption.id}
                className="scroll-mt-24 grid gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-[8px] target:ring-2 target:ring-blue-200 sm:grid-cols-[1fr_1fr_auto]"
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
