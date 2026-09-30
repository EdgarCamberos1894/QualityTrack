import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import type { NonConformityDto } from '../types/quality.types'

interface NonConformityDispositionDialogProps {
  open: boolean
  nonConformity: NonConformityDto
  canRework: boolean
  canScrap: boolean
  canUseAsIs: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onRework: () => void
  onScrap: () => void
  onUseAsIs: () => void
}

interface ChoiceProps {
  code: string
  title: string
  description: string
  permission: string
  enabled: boolean
  submitting: boolean
  onClick: () => void
}

function Choice({
  code,
  title,
  description,
  permission,
  enabled,
  submitting,
  onClick,
}: ChoiceProps) {
  return (
    <button
      type="button"
      disabled={!enabled || submitting}
      onClick={onClick}
      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">
            {code}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-[10px] leading-5 text-slate-600">
            {description}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold text-slate-600">
          {enabled ? 'Elegir' : permission}
        </span>
      </div>
    </button>
  )
}

export function NonConformityDispositionDialog({
  open,
  nonConformity,
  canRework,
  canScrap,
  canUseAsIs,
  submitting,
  error,
  onClose,
  onRework,
  onScrap,
  onUseAsIs,
}: NonConformityDispositionDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nc-disposition-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-red-700">
            {nonConformity.number}
          </p>
          <h2
            id="nc-disposition-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Definir disposición
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            La decisión queda registrada en la NC y no modifica la inspección
            REJECTED que la originó.
          </p>
        </div>

        <div className="space-y-3 px-6 py-5">
          <Choice
            code="REWORK"
            title="Retrabajar"
            description="Crea una nueva revisión de routing ligada a la NC. La NC permanece OPEN hasta aprobar la reinspección."
            permission="ENGINEERING"
            enabled={canRework}
            submitting={submitting}
            onClick={onRework}
          />
          <Choice
            code="SCRAP"
            title="Descartar"
            description="Retira la cantidad afectada. El servidor calculará si la cantidad restante permite liberar la OT."
            permission="QUALITY / ENGINEERING"
            enabled={canScrap}
            submitting={submitting}
            onClick={onScrap}
          />
          <Choice
            code="USE_AS_IS"
            title="Aceptar bajo concesión"
            description="Conserva la desviación como evidencia y libera la OT únicamente con autorización y justificación de ADMIN."
            permission="ADMIN"
            enabled={canUseAsIs}
            submitting={submitting}
            onClick={onUseAsIs}
          />

          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] leading-5 text-amber-800">
            La disposición no puede cambiarse por otra una vez registrada.
          </p>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
