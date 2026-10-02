import type { AuthenticatedUser } from '@/modules/auth'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { getJobCaseCapabilities } from '../model/jobCaseCapabilities'
import {
  formatJobCaseDate,
  getJobCaseClarificationSummary,
  getJobCaseMaterialSummary,
  getJobCaseStatusPresentation,
} from '../model/jobCasePresenter'
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

type ReviewTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger'

interface ReviewContext {
  eyebrow: string
  title: string
  description: string
  tone: ReviewTone
}

const toneClasses: Record<ReviewTone, string> = {
  neutral: 'border-slate-200 bg-slate-50/70',
  info: 'border-blue-100 bg-blue-50/65',
  warning: 'border-amber-200 bg-amber-50/70',
  success: 'border-emerald-200 bg-emerald-50/70',
  danger: 'border-red-200 bg-red-50/70',
}

const eyebrowClasses: Record<ReviewTone, string> = {
  neutral: 'text-slate-500',
  info: 'text-blue-700',
  warning: 'text-amber-700',
  success: 'text-emerald-700',
  danger: 'text-red-700',
}

function getReviewContext(
  jobCase: JobCaseDetailDto,
  completeBlockReason: string | null,
): ReviewContext {
  switch (jobCase.status) {
    case 'SUBMITTED':
      return {
        eyebrow: 'Asignación pendiente',
        title: 'El expediente necesita un responsable',
        description:
          'Comercial debe tomar el expediente antes de iniciar la revisión interna.',
        tone: 'neutral',
      }
    case 'WAITING_CUSTOMER_INFO':
      return {
        eyebrow: 'Revisión pausada',
        title: 'Esperando información del cliente',
        description:
          'La revisión continuará cuando el cliente responda la aclaración pendiente.',
        tone: 'warning',
      }
    case 'UNDER_REVIEW':
      if (completeBlockReason) {
        return {
          eyebrow: 'Pendiente de revisión',
          title: 'Todavía falta resolver información',
          description: completeBlockReason,
          tone: 'warning',
        }
      }

      return {
        eyebrow: 'Siguiente paso',
        title: 'La revisión puede completarse',
        description:
          'Valida la solicitud y sus documentos antes de marcar el expediente como listo para cotizar.',
        tone: 'info',
      }
    case 'READY_FOR_QUOTATION':
      return {
        eyebrow: 'Revisión completada',
        title: 'Expediente listo para cotizar',
        description:
          'No existen pendientes bloqueantes. Comercial puede preparar la propuesta.',
        tone: 'success',
      }
    case 'IN_PRODUCTION':
      return {
        eyebrow: 'Etapa operativa',
        title: 'El trabajo ya está en producción',
        description:
          'La revisión y la cotización quedaron atrás. El seguimiento continúa desde la orden de trabajo.',
        tone: 'info',
      }
    case 'COMPLETED':
      return {
        eyebrow: 'Trabajo finalizado',
        title: 'Expediente completado',
        description:
          'El trabajo terminó su recorrido operativo y el expediente quedó cerrado.',
        tone: 'success',
      }
    case 'CANCELLED':
      return {
        eyebrow: 'Flujo detenido',
        title: 'Expediente cancelado',
        description:
          jobCase.cancellationReason ??
          'El expediente se cerró antes de continuar con el trabajo.',
        tone: 'danger',
      }
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
  const status = getJobCaseStatusPresentation(jobCase.status)
  const canOpenQuotation = quotationId !== null
  const canCreateQuotation =
    capabilities.canCreateQuotation &&
    quotationLookupReady &&
    quotationId === null
  const context = getReviewContext(
    jobCase,
    capabilities.completeBlockReason,
  )
  const clarificationSummary = getJobCaseClarificationSummary(
    jobCase.informationRequests,
  )
  const materialSummary = getJobCaseMaterialSummary(jobCase)

  return (
    <Card className="h-full border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/20 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <SidebarNavIcon name="cases" className="h-[17px] w-[17px]" />
        </div>
        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Revisión interna
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-950">
              {status.label}
            </h2>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          </div>
        </div>
      </div>

      <div
        className={`mt-3 rounded-xl border px-3.5 py-3 ${toneClasses[context.tone]}`}
      >
        <p
          className={`text-[8px] font-bold uppercase tracking-[0.1em] ${eyebrowClasses[context.tone]}`}
        >
          {context.eyebrow}
        </p>
        <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-950">
          {context.title}
        </p>
        <p className="mt-1 text-[9px] leading-4 text-slate-600">
          {context.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {capabilities.canTake ? (
            <Button
              size="sm"
              className="!h-7 !px-3 !text-[8px]"
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
            >
              {completing ? 'Completando…' : 'Completar revisión'}
            </Button>
          ) : null}

          {canOpenQuotation ? (
            <Button
              size="sm"
              className="!h-7 !px-3 !text-[8px]"
              onClick={onOpenQuotation}
            >
              Abrir cotización
            </Button>
          ) : canCreateQuotation ? (
            <Button
              size="sm"
              className="!h-7 !px-3 !text-[8px]"
              onClick={onCreateQuotation}
              disabled={creatingQuotation}
            >
              {creatingQuotation ? 'Creando…' : 'Crear cotización'}
            </Button>
          ) : null}
        </div>
      </div>

      <dl className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
        <div className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-[8px] text-slate-500">Responsable</dt>
          <dd className="truncate text-[9px] font-semibold text-slate-900">
            {jobCase.assignedToName ?? 'Sin asignar'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-[8px] text-slate-500">Aclaraciones</dt>
          <dd className="text-right text-[9px] font-semibold text-slate-900">
            {clarificationSummary}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-[8px] text-slate-500">Material técnico</dt>
          <dd className="max-w-[65%] text-right text-[9px] font-semibold text-slate-900">
            {materialSummary}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-[8px] text-slate-500">Tomado para revisión</dt>
          <dd className="text-right text-[8px] font-medium text-slate-700">
            {formatJobCaseDate(jobCase.assignedAt)}
          </dd>
        </div>
      </dl>
    </Card>
  )
}
