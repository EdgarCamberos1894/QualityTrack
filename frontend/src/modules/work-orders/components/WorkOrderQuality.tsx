import { useMemo, useState } from 'react'
import { useSessionStore } from '@/modules/auth'
import type { RecordMaterialConsumptionPayload } from '@/modules/materials'
import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { CompleteQualityInspectionDialog } from './CompleteQualityInspectionDialog'
import { NonConformitySection } from './NonConformitySection'
import { QualityInspectionCard } from './QualityInspectionCard'
import { QualityMeasurementDialog } from './QualityMeasurementDialog'
import { ProductionMaterialsCard } from './ProductionMaterialsCard'
import { useQualityMutations } from '../hooks/useQualityMutations'
import { useProductionMutations } from '../hooks/useProductionMutations'
import type { QualityMeasurementFormValues } from '../schemas/quality.schemas'
import type {
  QualityInspectionDto,
  QualityMeasurementDto,
} from '../types/quality.types'
import type { WorkOrder360Dto } from '../types/workOrder360.types'

interface WorkOrderQualityProps {
  data: WorkOrder360Dto
}

interface MeasurementTarget {
  inspectionId: number
  measurement: QualityMeasurementDto | null
}

export function WorkOrderQuality({ data }: WorkOrderQualityProps) {
  const session = useSessionStore((state) => state.session)
  const roles = session?.user.roles ?? []
  const currentUserId = Number(session?.user.id)
  const isAdmin = roles.includes('ADMIN')
  const isQuality = roles.includes('QUALITY')
  const isProduction = roles.includes('PRODUCTION')
  const canManageQuality = isAdmin || isQuality
  const canRecordReworkMaterial =
    (isAdmin || isProduction) && data.workOrder.status === 'REWORK_IN_PROGRESS'
  const mutations = useQualityMutations(data.workOrder.id)
  const productionMutations = useProductionMutations(data.workOrder.id)
  const [measurementTarget, setMeasurementTarget] =
    useState<MeasurementTarget | null>(null)
  const [completionTarget, setCompletionTarget] =
    useState<QualityInspectionDto | null>(null)

  const inspections = useMemo(
    () =>
      [...data.qualityInspections].sort((left, right) => right.id - left.id),
    [data.qualityInspections],
  )

  const actionError = mutations.startInspection.error

  const canModifyInspection = (inspection: QualityInspectionDto) =>
    inspection.status === 'IN_PROGRESS' &&
    (isAdmin ||
      (isQuality &&
        Number.isFinite(currentUserId) &&
        inspection.inspectorId === currentUserId))

  const startInspection = async (inspectionId: number) => {
    mutations.startInspection.reset()

    try {
      await mutations.startInspection.mutateAsync({
        inspectionId,
        payload: {},
      })
    } catch {
      // El error se presenta dentro de la pestaña.
    }
  }

  const saveMeasurement = async (values: QualityMeasurementFormValues) => {
    if (!measurementTarget) return false

    const payload = {
      characteristic: values.characteristic.trim(),
      nominalValue: values.nominalValue,
      lowerLimit: values.lowerLimit,
      upperLimit: values.upperLimit,
      measuredValue: values.measuredValue,
      unit: values.unit.trim(),
      ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
    }

    try {
      if (measurementTarget.measurement) {
        await mutations.updateMeasurement.mutateAsync({
          inspectionId: measurementTarget.inspectionId,
          measurementId: measurementTarget.measurement.id,
          payload,
        })
      } else {
        await mutations.addMeasurement.mutateAsync({
          inspectionId: measurementTarget.inspectionId,
          payload,
        })
      }

      setMeasurementTarget(null)
      return true
    } catch {
      return false
    }
  }

  const completeInspection = async () => {
    if (!completionTarget) return false

    try {
      await mutations.completeInspection.mutateAsync(completionTarget.id)
      setCompletionTarget(null)
      return true
    } catch {
      return false
    }
  }

  const recordReworkMaterial = async (
    payload: RecordMaterialConsumptionPayload,
  ) => {
    try {
      await productionMutations.recordConsumption.mutateAsync(payload)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
        <div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Calidad
            </p>
            <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
              Inspección, no conformidades y corrección trazable
            </h2>
            <p className="mt-0.5 max-w-2xl text-[8px] leading-4 text-slate-400">
              Las mediciones determinan PASS o FAIL y cada corrección conserva la historia original.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="info" className="px-2 py-0.5 text-[8px]">
              {inspections.length} inspecciones
            </Badge>
            <Badge
              tone={
                data.nonConformities.some((nc) => nc.status === 'OPEN')
                  ? 'danger'
                  : 'neutral'
              }
              className="px-2 py-0.5 text-[8px]"
            >
              {data.nonConformities.filter((nc) => nc.status === 'OPEN').length}{' '}
              NC abiertas
            </Badge>
          </div>
        </div>
      </section>

      {!canManageQuality ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-[8px] leading-4 text-slate-500">
          Las inspecciones son de solo lectura para tu rol. Las acciones de NC,
          ingeniería y retrabajo aparecen únicamente cuando tu rol las permite.
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
          {getErrorMessage(actionError)}
        </p>
      ) : null}

      {data.nonConformities.length > 0 ? (
        <NonConformitySection data={data} />
      ) : null}

      {data.workOrder.status === 'REWORK_IN_PROGRESS' ? (
        <ProductionMaterialsCard
          consumptions={data.materials}
          canRecord={canRecordReworkMaterial}
          submitting={productionMutations.recordConsumption.isPending}
          error={productionMutations.recordConsumption.error}
          onRecord={recordReworkMaterial}
        />
      ) : null}

      <section className="space-y-2.5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Inspecciones
            </p>
            <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
              Historial de calidad
            </h2>
          </div>
          <span className="text-[8px] text-slate-400">{inspections.length} registros</span>
        </div>

        {inspections.length === 0 ? (
          <EmptyState
            title="Sin inspecciones"
            description="La inspección aparece después de completar Producción y ejecutar explícitamente Enviar a Calidad."
          />
        ) : (
          <div className="space-y-2.5">
            {inspections.map((inspection) => {
              const canEdit = canModifyInspection(inspection)
              const canStart =
                canManageQuality &&
                inspection.status === 'PENDING' &&
                data.workOrder.status === 'QUALITY_PENDING'

              return (
                <QualityInspectionCard
                  key={inspection.id}
                  inspection={inspection}
                  canStart={canStart}
                  canEdit={canEdit}
                  canComplete={canEdit}
                  starting={
                    mutations.startInspection.isPending &&
                    mutations.startInspection.variables?.inspectionId ===
                      inspection.id
                  }
                  onStart={() => void startInspection(inspection.id)}
                  onAddMeasurement={() => {
                    mutations.addMeasurement.reset()
                    setMeasurementTarget({
                      inspectionId: inspection.id,
                      measurement: null,
                    })
                  }}
                  onEditMeasurement={(measurement) => {
                    mutations.updateMeasurement.reset()
                    setMeasurementTarget({
                      inspectionId: inspection.id,
                      measurement,
                    })
                  }}
                  onComplete={() => {
                    mutations.completeInspection.reset()
                    setCompletionTarget(inspection)
                  }}
                />
              )
            })}
          </div>
        )}
      </section>

      <QualityMeasurementDialog
        open={measurementTarget !== null}
        measurement={measurementTarget?.measurement ?? null}
        submitting={
          mutations.addMeasurement.isPending ||
          mutations.updateMeasurement.isPending
        }
        error={
          measurementTarget?.measurement
            ? mutations.updateMeasurement.error
            : mutations.addMeasurement.error
        }
        onClose={() => {
          mutations.addMeasurement.reset()
          mutations.updateMeasurement.reset()
          setMeasurementTarget(null)
        }}
        onSubmit={saveMeasurement}
      />

      <CompleteQualityInspectionDialog
        inspection={completionTarget}
        submitting={mutations.completeInspection.isPending}
        error={mutations.completeInspection.error}
        onClose={() => {
          mutations.completeInspection.reset()
          setCompletionTarget(null)
        }}
        onConfirm={completeInspection}
      />
    </div>
  )
}
