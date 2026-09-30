import { useMemo, useState } from 'react'
import { useSessionStore } from '@/modules/auth'
import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { CompleteQualityInspectionDialog } from './CompleteQualityInspectionDialog'
import { NonConformitySection } from './NonConformitySection'
import { QualityInspectionCard } from './QualityInspectionCard'
import { QualityMeasurementDialog } from './QualityMeasurementDialog'
import { useQualityMutations } from '../hooks/useQualityMutations'
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
  const canManageQuality = isAdmin || isQuality
  const mutations = useQualityMutations(data.workOrder.id)
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

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
              Calidad
            </p>
            <h2 className="mt-1 text-base font-semibold text-slate-950">
              Inspección formal, NC y corrección trazable
            </h2>
            <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-600">
              Las mediciones determinan PASS o FAIL en servidor. Una desviación
              conserva su inspección original y se resuelve mediante una NC
              trazable, sin reescribir producción.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{inspections.length} inspecciones</Badge>
            <Badge
              tone={
                data.nonConformities.some((nc) => nc.status === 'OPEN')
                  ? 'danger'
                  : 'neutral'
              }
            >
              {data.nonConformities.filter((nc) => nc.status === 'OPEN').length}{' '}
              NC abiertas
            </Badge>
          </div>
        </div>
      </section>

      {!canManageQuality ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] leading-5 text-slate-600">
          Las inspecciones son de solo lectura para tu rol. Las acciones de NC,
          ingeniería y retrabajo aparecen únicamente cuando tu rol las permite.
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {getErrorMessage(actionError)}
        </p>
      ) : null}

      {data.nonConformities.length > 0 ? (
        <NonConformitySection data={data} />
      ) : null}

      <section className="space-y-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
            Inspecciones
          </p>
          <h2 className="mt-1 text-sm font-semibold text-slate-950">
            Historial de Calidad
          </h2>
        </div>

        {inspections.length === 0 ? (
          <EmptyState
            title="Sin inspecciones"
            description="La inspección aparece después de completar Producción y ejecutar explícitamente Enviar a Calidad."
          />
        ) : (
          <div className="space-y-4">
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
