import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  countMeasurementResults,
  formatQualityDateTime,
  formatQualityNumber,
  getNonConformityDispositionLabel,
  getQualityInspectionStatusPresentation,
} from '../model/qualityPresenter'
import type {
  QualityInspectionDto,
  QualityMeasurementDto,
} from '../types/quality.types'

interface QualityInspectionCardProps {
  inspection: QualityInspectionDto
  canStart: boolean
  canEdit: boolean
  canComplete: boolean
  starting: boolean
  onStart: () => void
  onAddMeasurement: () => void
  onEditMeasurement: (measurement: QualityMeasurementDto) => void
  onComplete: () => void
}

export function QualityInspectionCard({
  inspection,
  canStart,
  canEdit,
  canComplete,
  starting,
  onStart,
  onAddMeasurement,
  onEditMeasurement,
  onComplete,
}: QualityInspectionCardProps) {
  const status = getQualityInspectionStatusPresentation(inspection.status)
  const totals = countMeasurementResults(inspection.measurements)
  const isReinspection = inspection.reworkNonConformityId !== null

  return (
    <article
      id={`quality-inspection-${inspection.id}`}
      className="scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm target:ring-2 target:ring-blue-300"
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
              {isReinspection ? 'Reinspección' : 'Inspección'} #{inspection.id}
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-950">
              {inspection.inspectorName ?? 'Inspector por asignar'}
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Creada {formatQualityDateTime(inspection.createdAt)}
              {isReinspection
                ? ` · ligada a ${inspection.nonConformity?.number ?? `NC #${inspection.reworkNonConformityId}`}`
                : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isReinspection ? <Badge tone="warning">REWORK</Badge> : null}
            <Badge tone={status.tone}>{status.label}</Badge>
            {inspection.measurements.length > 0 ? (
              <>
                <Badge tone="success">{totals.pass} PASS</Badge>
                <Badge tone={totals.fail > 0 ? 'danger' : 'neutral'}>
                  {totals.fail} FAIL
                </Badge>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-[10px] sm:grid-cols-3">
          <div>
            <p className="text-slate-400">Inicio</p>
            <p className="mt-1 font-medium text-slate-700">
              {formatQualityDateTime(inspection.startedAt)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Cierre</p>
            <p className="mt-1 font-medium text-slate-700">
              {formatQualityDateTime(inspection.completedAt)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Mediciones</p>
            <p className="mt-1 font-medium text-slate-700">
              {inspection.measurements.length}
            </p>
          </div>
        </div>

        {inspection.status === 'PENDING' && canStart ? (
          <div className="mt-4 flex justify-end">
            <Button onClick={onStart} disabled={starting}>
              {starting
                ? 'Iniciando…'
                : isReinspection
                  ? 'Iniciar reinspección'
                  : 'Iniciar inspección'}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-950">
              Mediciones dimensionales y de proceso
            </h3>
            <p className="mt-1 text-[9px] text-slate-500">
              El resultado se calcula en servidor. No existe edición manual de
              PASS o FAIL.
            </p>
          </div>

          {inspection.status === 'IN_PROGRESS' && canEdit ? (
            <Button size="sm" variant="secondary" onClick={onAddMeasurement}>
              + Registrar medición
            </Button>
          ) : null}
        </div>

        {inspection.measurements.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-[10px] text-slate-500">
            Todavía no hay mediciones. Se requiere al menos una para finalizar
            la inspección.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-[760px] w-full text-left">
              <thead className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Característica</th>
                  <th className="px-3 py-2 font-semibold">Nominal</th>
                  <th className="px-3 py-2 font-semibold">Rango</th>
                  <th className="px-3 py-2 font-semibold">Medido</th>
                  <th className="px-3 py-2 font-semibold">Resultado</th>
                  <th className="px-3 py-2 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[10px] text-slate-700">
                {inspection.measurements.map((measurement) => (
                  <tr
                    id={`quality-measurement-${measurement.id}`}
                    key={measurement.id}
                    className="scroll-mt-24 target:bg-blue-50"
                  >
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">
                        {measurement.characteristic}
                      </p>
                      {measurement.notes ? (
                        <p className="mt-1 max-w-xs text-[9px] text-slate-500">
                          {measurement.notes}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      {formatQualityNumber(measurement.nominalValue)}{' '}
                      {measurement.unit}
                    </td>
                    <td className="px-3 py-3">
                      {formatQualityNumber(measurement.lowerLimit)} –{' '}
                      {formatQualityNumber(measurement.upperLimit)}{' '}
                      {measurement.unit}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-950">
                      {formatQualityNumber(measurement.measuredValue)}{' '}
                      {measurement.unit}
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        tone={
                          measurement.result === 'PASS' ? 'success' : 'danger'
                        }
                      >
                        {measurement.result}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {inspection.status === 'IN_PROGRESS' && canEdit ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditMeasurement(measurement)}
                        >
                          Editar
                        </Button>
                      ) : (
                        <span className="text-[9px] text-slate-400">
                          Bloqueada
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {inspection.status === 'IN_PROGRESS' && canComplete ? (
          <div className="flex justify-end border-t border-slate-100 pt-3">
            <Button
              onClick={onComplete}
              disabled={inspection.measurements.length === 0}
            >
              {isReinspection
                ? 'Finalizar reinspección'
                : 'Finalizar inspección'}
            </Button>
          </div>
        ) : null}

        {inspection.nonConformity ? (
          <section className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-red-700">
                  No conformidad relacionada
                </p>
                <h3 className="mt-1 text-sm font-semibold text-red-950">
                  {inspection.nonConformity.number}
                </h3>
              </div>
              <Badge
                tone={
                  inspection.nonConformity.status === 'OPEN'
                    ? 'danger'
                    : 'success'
                }
              >
                {inspection.nonConformity.status}
              </Badge>
            </div>

            <div className="mt-3 grid gap-3 text-[10px] sm:grid-cols-3">
              <div>
                <p className="text-red-600">Piezas afectadas</p>
                <p className="mt-1 font-semibold text-red-950">
                  {inspection.nonConformity.affectedQuantity ?? 'Pendiente'}
                </p>
              </div>
              <div>
                <p className="text-red-600">Severidad</p>
                <p className="mt-1 font-semibold text-red-950">
                  {inspection.nonConformity.severity ?? 'Pendiente'}
                </p>
              </div>
              <div>
                <p className="text-red-600">Disposición</p>
                <p className="mt-1 font-semibold text-red-950">
                  {getNonConformityDispositionLabel(
                    inspection.nonConformity.disposition,
                  )}
                </p>
              </div>
            </div>

            {inspection.nonConformity.description ? (
              <p className="mt-3 text-[10px] leading-5 text-red-800">
                {inspection.nonConformity.description}
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </article>
  )
}
