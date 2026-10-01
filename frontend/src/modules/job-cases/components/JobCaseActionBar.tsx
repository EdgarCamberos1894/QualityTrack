import type { AuthenticatedUser } from '@/modules/auth'
import { Button } from '@/shared/components/ui/Button'
import { getJobCaseCapabilities } from '../model/jobCaseCapabilities'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseActionBarProps {
  jobCase: JobCaseDetailDto
  user: AuthenticatedUser
  taking: boolean
  completing: boolean
  creatingQuotation: boolean
  quotationId: number | null
  quotationLookupReady: boolean
  onTake: () => void
  onRequestInformation: () => void
  onDefineMaterial: () => void
  onComplete: () => void
  onCreateQuotation: () => void
  onOpenQuotation: () => void
}

export function JobCaseActionBar({
  jobCase,
  user,
  taking,
  completing,
  creatingQuotation,
  quotationId,
  quotationLookupReady,
  onTake,
  onRequestInformation,
  onDefineMaterial,
  onComplete,
  onCreateQuotation,
  onOpenQuotation,
}: JobCaseActionBarProps) {
  const capabilities = getJobCaseCapabilities(jobCase, user)
  const canOpenQuotation = quotationId !== null
  const canCreateQuotation =
    capabilities.canCreateQuotation &&
    quotationLookupReady &&
    quotationId === null
  const hasActions =
    capabilities.canTake ||
    capabilities.canRequestInformation ||
    capabilities.canDefineMaterial ||
    capabilities.canAttemptComplete ||
    canCreateQuotation ||
    canOpenQuotation

  if (!hasActions) return null

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex flex-col gap-2.5 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Acciones del expediente
          </p>
          <p className="mt-0.5 text-[9px] text-slate-500">
            Solo se muestran las acciones disponibles para tu rol y el estado actual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {capabilities.canTake ? (
            <Button
              size="sm"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onTake}
              disabled={taking}
            >
              {taking ? 'Tomando…' : 'Tomar expediente'}
            </Button>
          ) : null}

          {capabilities.canRequestInformation ? (
            <Button
              size="sm"
              variant="secondary"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onRequestInformation}
            >
              Solicitar aclaración
            </Button>
          ) : null}

          {capabilities.canDefineMaterial ? (
            <Button
              size="sm"
              variant="secondary"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onDefineMaterial}
            >
              {jobCase.materialSpecification
                ? 'Actualizar material'
                : 'Definir material'}
            </Button>
          ) : null}

          {capabilities.canAttemptComplete ? (
            <Button
              size="sm"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onComplete}
              disabled={completing || !capabilities.canCompleteReview}
              title={capabilities.completeBlockReason ?? undefined}
            >
              {completing ? 'Completando…' : 'Completar revisión'}
            </Button>
          ) : null}

          {canOpenQuotation ? (
            <Button
              size="sm"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onOpenQuotation}
            >
              Abrir cotización
            </Button>
          ) : canCreateQuotation ? (
            <Button
              size="sm"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onCreateQuotation}
              disabled={creatingQuotation}
            >
              {creatingQuotation ? 'Creando…' : 'Crear cotización'}
            </Button>
          ) : null}
        </div>
      </div>

      {capabilities.completeBlockReason ? (
        <div className="flex items-start gap-2 bg-amber-50/70 px-3.5 py-2">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
          <p className="text-[8px] leading-4 text-amber-800">
            {capabilities.completeBlockReason}
          </p>
        </div>
      ) : null}
    </section>
  )
}
