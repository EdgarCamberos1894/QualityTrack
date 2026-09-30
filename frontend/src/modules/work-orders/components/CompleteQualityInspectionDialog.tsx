import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { countMeasurementResults } from '../model/qualityPresenter'
import type { QualityInspectionDto } from '../types/quality.types'

interface CompleteQualityInspectionDialogProps {
  inspection: QualityInspectionDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onConfirm: () => Promise<boolean>
}

export function CompleteQualityInspectionDialog({
  inspection,
  submitting,
  error,
  onClose,
  onConfirm,
}: CompleteQualityInspectionDialogProps) {
  if (!inspection) return null

  const totals = countMeasurementResults(inspection.measurements)

  const confirm = async () => {
    await onConfirm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-quality-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
            Cerrar inspección
          </p>
          <h2
            id="complete-quality-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Finalizar inspección #{inspection.id}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            El resultado es definitivo para esta inspección. Una inspección
            rechazada no se sobrescribe después.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[9px] text-slate-500">Mediciones</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {inspection.measurements.length}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[9px] text-emerald-700">PASS</p>
              <p className="mt-1 text-lg font-semibold text-emerald-950">
                {totals.pass}
              </p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-[9px] text-red-700">FAIL</p>
              <p className="mt-1 text-lg font-semibold text-red-950">
                {totals.fail}
              </p>
            </div>
          </div>

          {totals.fail > 0 ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <Badge tone="danger">REJECTED</Badge>
                <p className="text-xs font-semibold text-red-950">
                  Se abrirá una no conformidad
                </p>
              </div>
              <p className="mt-2 text-[10px] leading-5 text-red-800">
                El backend conservará esta inspección como REJECTED, creará una
                NC OPEN trazable y moverá la orden a QUALITY_HOLD.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <Badge tone="success">APPROVED</Badge>
                <p className="text-xs font-semibold text-emerald-950">
                  La orden podrá avanzar
                </p>
              </div>
              <p className="mt-2 text-[10px] leading-5 text-emerald-800">
                Todas las mediciones cumplen. La orden pasará a
                READY_FOR_DELIVERY, sin marcarse todavía como entregada.
              </p>
            </div>
          )}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant={totals.fail > 0 ? 'danger' : 'primary'}
            onClick={() => void confirm()}
            disabled={submitting}
          >
            {submitting ? 'Finalizando…' : 'Finalizar inspección'}
          </Button>
        </div>
      </div>
    </div>
  )
}
