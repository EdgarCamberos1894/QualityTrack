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
      className="scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-28px_rgba(15,23,42,0.28)] target:ring-2 target:ring-blue-200"
    >
      <div className="border-b border-slate-100 px-3.5 py-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-blue-600">
              {isReinspection ? 'Reinspección' : 'Inspección'} #{inspection.id}
            </p>
            <h2 className="mt-0.5 text-[10px] font-semibold text-slate-950">
              {inspection.inspectorName ?? 'Inspector por asignar'}
            </h2>
            <p className="mt-0.5 text-[8px] text-slate-400">
              Creada {formatQualityDateTime(inspection.createdAt)}
              {isReinspection
                ? ` · ligada a ${inspection.nonConformity?.number ?? `NC #${inspection.reworkNonConformityId}`}`
                : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {isReinspection ? (
              <Badge tone="warning" className="px-2 py-0.5 text-[7px]">
                RETRABAJO
              </Badge>
            ) : null}
            <Badge tone={status.tone} className="px-2 py-0.5 text-[7px]">
              {status.label}
            </Badge>
            {inspection.measurements.length > 0 ? (
              <>
                <Badge tone="success" className="px-2 py-0.5 text-[7px]">
                  {totals.pass} PASS
                </Badge>
                <Badge
                  tone={totals.fail > 0 ? 'danger' : 'neutral'}
                  className="px-2 py-0.5 text-[7px]"
                >
                  {totals.fail} FAIL
                </Badge>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-2.5 grid gap-2 text-[8px] sm:grid-cols-3">
          <div>
            <p className="text-slate-400">Inicio</p>
            <p className="mt-0.5 font-medium text-slate-700">
              {formatQualityDateTime(inspection.startedAt)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Cierre</p>
            <p className="mt-0.5 font-medium text-slate-700">
              {formatQualityDateTime(inspection.completedAt)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Mediciones</p>
            <p className="mt-0.5 font-medium text-slate-700">
              {inspection.measurements.length}
            </p>
          </div>
        </div>

        {inspection.status === 'PENDING' && canStart ? (
          <div className="mt-2.5 flex justify-end">
            <Button
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onStart}
              disabled={starting}
            >
              {starting
                ? 'Iniciando…'
                : isReinspection
                  ? 'Iniciar reinspección'
                  : 'Iniciar inspección'}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="space-y-2.5 px-3.5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <h3 className="text-[9px] font-semibold text-slate-950">
              Mediciones dimensionales y de proceso
            </h3>
            <p className="mt-0.5 text-[7px] text-slate-400">
              El resultado PASS o FAIL se calcula en servidor.
            </p>
          </div>

          {inspection.status === 'IN_PROGRESS' && canEdit ? (
            <Button
              size="sm"
              variant="secondary"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onAddMeasurement}
            >
              Registrar medición
            </Button>
          ) : null}
        </div>

        {inspection.measurements.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-[8px] text-slate-500">
            Todavía no hay mediciones. Se requiere al menos una para finalizar la inspección.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2">Característica</th>
                  <th className="px-3 py-2">Nominal</th>
                  <th className="px-3 py-2">Rango</th>
                  <th className="px-3 py-2">Medido</th>
                  <th className="px-3 py-2">Resultado</th>
                  <th className="px-3 py-2 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[8px] text-slate-600">
                {inspection.measurements.map((measurement) => (
                  <tr
                    id={`quality-measurement-${measurement.id}`}
                    key={measurement.id}
                    className="scroll-mt-24 target:bg-blue-50/40"
                  >
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-slate-900">
                        {measurement.characteristic}
                      </p>
                      {measurement.notes ? (
                        <p className="mt-0.5 max-w-xs text-[7px] text-slate-400">
                          {measurement.notes}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      {formatQualityNumber(measurement.nominalValue)} {measurement.unit}
                    </td>
                    <td className="px-3 py-2.5">
                      {formatQualityNumber(measurement.lowerLimit)} –{' '}
                      {formatQualityNumber(measurement.upperLimit)} {measurement.unit}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">
                      {formatQualityNumber(measurement.measuredValue)} {measurement.unit}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        tone={measurement.result === 'PASS' ? 'success' : 'danger'}
                        className="px-2 py-0.5 text-[7px]"
                      >
                        {measurement.result}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {inspection.status === 'IN_PROGRESS' && canEdit ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="!h-7 !px-2 !text-[8px]"
                          onClick={() => onEditMeasurement(measurement)}
                        >
                          Editar
                        </Button>
                      ) : (
                        <span className="text-[7px] text-slate-400">
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
          <div className="flex justify-end border-t border-slate-100 pt-2.5">
            <Button
              className="!h-7 !px-2.5 !text-[8px]"
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
          <section className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[7px] font-bold uppercase tracking-wide text-red-600">
                  No conformidad relacionada
                </p>
                <h3 className="mt-0.5 text-[10px] font-semibold text-red-950">
                  {inspection.nonConformity.number}
                </h3>
              </div>
              <Badge
                tone={
                  inspection.nonConformity.status === 'OPEN'
                    ? 'danger'
                    : 'success'
                }
                className="px-2 py-0.5 text-[7px]"
              >
                {inspection.nonConformity.status}
              </Badge>
            </div>

            <div className="mt-2 grid gap-2 text-[8px] sm:grid-cols-3">
              <DataItem
                label="Piezas afectadas"
                value={inspection.nonConformity.affectedQuantity ?? 'Pendiente'}
              />
              <DataItem
                label="Severidad"
                value={inspection.nonConformity.severity ?? 'Pendiente'}
              />
              <DataItem
                label="Disposición"
                value={getNonConformityDispositionLabel(
                  inspection.nonConformity.disposition,
                )}
              />
            </div>

            {inspection.nonConformity.description ? (
              <p className="mt-2 text-[8px] leading-4 text-red-800">
                {inspection.nonConformity.description}
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </article>
  )
}

function DataItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-red-600">{label}</p>
      <p className="mt-0.5 font-semibold text-red-950">{value}</p>
    </div>
  )
}
