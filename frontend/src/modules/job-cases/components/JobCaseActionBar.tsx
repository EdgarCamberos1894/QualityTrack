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

function getReviewContext(jobCase: JobCaseDetailDto) {
  if (jobCase.status === 'SUBMITTED') {
    return {
      eyebrow: 'Asignación pendiente',
      title: 'El expediente todavía no está en revisión',
      description:
        'Un usuario de Comercial debe tomar el expediente antes de revisar la solicitud.',
    }
  }

  if (jobCase.status === 'WAITING_CUSTOMER_INFO') {
    return {
      eyebrow: 'Revisión pausada',
      title: 'Esperando información del cliente',
      description:
        'La revisión continuará cuando el cliente responda la aclaración pendiente.',
    }
  }

  if (jobCase.status === 'READY_FOR_QUOTATION') {
    return {
      eyebrow: 'Revisión completada',
      title: 'Expediente listo para cotizar',
      description:
        'No existen pendientes que bloqueen la preparación de la cotización.',
    }
  }

  return {
    eyebrow: 'Revisión del expediente',
    title: 'Valida la información antes de avanzar',
    description:
      'Revisa la solicitud, los documentos y las aclaraciones antes de completar esta etapa.',
  }
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
  const showReviewContext = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'WAITING_CUSTOMER_INFO',
    'READY_FOR_QUOTATION',
  ].includes(jobCase.status)

  if (!hasActions && !showReviewContext) return null

  const context = getReviewContext(jobCase)

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            {context.eyebrow}
          </p>
          <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
            {context.title}
          </h2>
          <p className="mt-0.5 max-w-2xl text-[8px] leading-4 text-slate-500">
            {context.description}
          </p>
        </div>

        {hasActions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
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
                  : jobCase.request.materialRequirementType ===
                      'ASSISTANCE_REQUIRED'
                    ? 'Definir material'
                    : 'Añadir criterio técnico'}
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
        ) : null}
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
