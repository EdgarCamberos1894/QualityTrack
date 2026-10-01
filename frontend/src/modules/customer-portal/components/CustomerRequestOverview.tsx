import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge, type BadgeProps } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import {
  formatCustomerRequestDate,
  formatCustomerRequestDateTime,
  getCustomerRequestStatusPresentation,
} from '../model/customerRequestPresenter'
import type {
  CustomerInformationRequestDto,
  CustomerRequestDetailDto,
} from '../types/customerRequest.types'
import { CustomerRequestFlowSteps } from './CustomerRequestFlowSteps'

interface CustomerRequestOverviewProps {
  customerId: number
  request: CustomerRequestDetailDto
  deliveryProgress?: 'IN_TRANSIT' | 'PARTIAL' | 'DELIVERED'
  canWrite: boolean
  canCancel: boolean
  openInformationRequest: CustomerInformationRequestDto | null
  latestResponse: CustomerInformationRequestDto | null
  onRespond: (request: CustomerInformationRequestDto) => void
  onCancel: () => void
}

interface DisplayStatus {
  label: string
  tone: BadgeProps['tone']
}

interface NextStepPresentation {
  eyebrow: string
  title: string
  description: string
  tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger'
  action?: 'respond' | 'quotations'
}

const nextStepToneClasses: Record<NextStepPresentation['tone'], string> = {
  neutral: 'border-slate-200 bg-slate-50/70',
  info: 'border-blue-100 bg-blue-50/65',
  warning: 'border-amber-200 bg-amber-50/70',
  success: 'border-emerald-200 bg-emerald-50/70',
  danger: 'border-red-200 bg-red-50/70',
}

const nextStepEyebrowClasses: Record<NextStepPresentation['tone'], string> = {
  neutral: 'text-slate-500',
  info: 'text-blue-700',
  warning: 'text-amber-700',
  success: 'text-emerald-700',
  danger: 'text-red-700',
}

function getDisplayStatus(
  request: CustomerRequestDetailDto,
  deliveryProgress?: 'IN_TRANSIT' | 'PARTIAL' | 'DELIVERED',
): DisplayStatus {
  const requestStatus = getCustomerRequestStatusPresentation(
    request.jobCase.status,
  )

  if (request.jobCase.status === 'COMPLETED') return requestStatus
  if (deliveryProgress === 'IN_TRANSIT') {
    return { label: 'En camino', tone: 'info' }
  }
  if (deliveryProgress === 'DELIVERED') {
    return { label: 'Entregada', tone: 'success' }
  }

  return requestStatus
}

function getNextStep(
  request: CustomerRequestDetailDto,
  deliveryProgress: 'IN_TRANSIT' | 'PARTIAL' | 'DELIVERED' | undefined,
  openInformationRequest: CustomerInformationRequestDto | null,
): NextStepPresentation {
  if (request.jobCase.status === 'CANCELLED') {
    return {
      eyebrow: 'Flujo detenido',
      title: 'Solicitud cancelada',
      description:
        request.jobCase.cancellationReason ??
        'La solicitud se cerró antes de continuar con el trabajo.',
      tone: 'danger',
    }
  }

  if (
    request.jobCase.status === 'COMPLETED' ||
    deliveryProgress === 'DELIVERED'
  ) {
    return {
      eyebrow: 'Trabajo finalizado',
      title: 'Entrega completada',
      description:
        'La cantidad solicitada figura como entregada y el trabajo llegó al final de su recorrido.',
      tone: 'success',
    }
  }

  if (deliveryProgress === 'IN_TRANSIT' || deliveryProgress === 'PARTIAL') {
    return {
      eyebrow: 'Entrega en curso',
      title:
        deliveryProgress === 'IN_TRANSIT'
          ? 'Tu trabajo va en camino'
          : 'La entrega ya comenzó',
      description:
        'Logística actualizará el seguimiento conforme se registren los movimientos de entrega.',
      tone: 'info',
    }
  }

  if (openInformationRequest) {
    return {
      eyebrow: 'Acción requerida',
      title: 'Necesitamos información de tu empresa',
      description: openInformationRequest.question,
      tone: 'warning',
      action: 'respond',
    }
  }

  switch (request.jobCase.status) {
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
      return {
        eyebrow: 'Revisión en curso',
        title: 'El equipo está revisando tu solicitud',
        description:
          'No necesitas hacer nada por ahora. Te avisaremos si necesitamos información adicional.',
        tone: 'neutral',
      }
    case 'WAITING_CUSTOMER_INFO':
      return {
        eyebrow: 'Pendiente de información',
        title: 'La revisión está esperando datos de tu empresa',
        description:
          'Revisa la actividad de la solicitud para identificar la información pendiente.',
        tone: 'warning',
      }
    case 'READY_FOR_QUOTATION':
      return {
        eyebrow: 'Siguiente etapa',
        title: 'La revisión técnica terminó',
        description:
          'El equipo está preparando la propuesta comercial. Cuando se envíe, aparecerá en Cotizaciones.',
        tone: 'info',
        action: 'quotations',
      }
    case 'IN_PRODUCTION':
      return {
        eyebrow: 'Producción activa',
        title: 'El trabajo está en fabricación',
        description:
          'El equipo continúa con la ejecución. El seguimiento avanzará cuando existan movimientos de entrega.',
        tone: 'info',
      }
    case 'COMPLETED':
    case 'CANCELLED':
      return {
        eyebrow: 'Estado',
        title: 'Seguimiento actualizado',
        description: 'Consulta la información registrada para este trabajo.',
        tone: 'neutral',
      }
  }
}

export function CustomerRequestOverview({
  customerId,
  request,
  deliveryProgress,
  canWrite,
  canCancel,
  openInformationRequest,
  latestResponse,
  onRespond,
  onCancel,
}: CustomerRequestOverviewProps) {
  const status = getDisplayStatus(request, deliveryProgress)
  const nextStep = getNextStep(
    request,
    deliveryProgress,
    openInformationRequest,
  )

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-[0_22px_60px_-34px_rgba(15,23,42,0.72)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/18 blur-3xl" />
          <div className="absolute bottom-[-110px] left-[30%] h-56 w-56 rounded-full bg-cyan-400/8 blur-3xl" />
          <div className="absolute inset-y-0 right-0 w-[38%] bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.16),transparent_38%)]" />
        </div>

        <div className="relative px-5 py-5 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <Link
                to={`/portal/${customerId}/requests`}
                className="inline-flex items-center gap-1.5 text-[8px] font-medium text-slate-400 transition hover:text-white"
              >
                <span aria-hidden="true">←</span>
                Volver a solicitudes
              </Link>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-300">
                  {request.requestNumber}
                </p>
                <Badge
                  tone={status.tone}
                  className="px-2 py-0.5 text-[8px] ring-1 ring-white/10"
                >
                  {status.label}
                </Badge>
              </div>

              <h1 className="mt-1.5 max-w-3xl text-xl font-bold tracking-tight text-white lg:text-[24px]">
                {request.title}
              </h1>
              <p className="mt-2 max-w-3xl text-[10px] leading-5 text-slate-400">
                Seguimiento completo del trabajo desde la solicitud hasta la
                entrega.
              </p>
            </div>

            {canCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-7 shrink-0 items-center self-start rounded-lg border border-white/10 bg-white/[0.045] px-2.5 text-[8px] font-medium text-slate-300 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-200"
              >
                Cancelar solicitud
              </button>
            ) : null}
          </div>

          <CustomerRequestFlowSteps
            status={request.jobCase.status}
            deliveryProgress={deliveryProgress}
            variant="dark"
          />
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <Card className="p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.3)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SidebarNavIcon name="requests" className="h-[17px] w-[17px]" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Información del trabajo
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
                Lo que solicitaste
              </h2>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-[8px] font-medium text-slate-500">Cantidad</p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-950">
                {request.quantity} pieza{request.quantity === 1 ? '' : 's'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-[8px] font-medium text-slate-500">Material</p>
              <p className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-4 text-slate-950">
                {request.materialRequirementType === 'ASSISTANCE_REQUIRED'
                  ? 'Asesoría técnica'
                  : request.materialRequirement}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-[8px] font-medium text-slate-500">
                Fecha requerida
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-950">
                {formatCustomerRequestDate(request.requestedDeliveryDate)}
              </p>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Descripción
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-5 text-slate-700">
              {request.description}
            </p>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Requisitos técnicos
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-[0.38fr_0.62fr]">
              <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
                <p className="text-[8px] text-slate-500">Definición</p>
                <p className="mt-0.5 text-[10px] font-semibold text-slate-900">
                  {request.materialRequirementType === 'ASSISTANCE_REQUIRED'
                    ? 'Asesoría técnica requerida'
                    : 'Material especificado'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
                <p className="text-[8px] text-slate-500">Detalle</p>
                <p className="mt-0.5 whitespace-pre-wrap text-[9px] leading-4 text-slate-700">
                  {request.materialRequirement}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <SidebarNavIcon name="cases" className="h-[17px] w-[17px]" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Estado del trabajo
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
            className={`mt-3 rounded-xl border px-3.5 py-3 ${nextStepToneClasses[nextStep.tone]}`}
          >
            <p
              className={`text-[8px] font-bold uppercase tracking-[0.1em] ${nextStepEyebrowClasses[nextStep.tone]}`}
            >
              {nextStep.eyebrow}
            </p>
            <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-950">
              {nextStep.title}
            </p>
            <p className="mt-1 text-[9px] leading-4 text-slate-600">
              {nextStep.description}
            </p>

            {nextStep.action === 'respond' && openInformationRequest ? (
              canWrite ? (
                <Button
                  size="sm"
                  className="mt-3 !h-7 !px-3 !text-[9px]"
                  onClick={() => onRespond(openInformationRequest)}
                >
                  Responder
                </Button>
              ) : (
                <p className="mt-2 text-[8px] font-medium text-amber-700">
                  Tu rol es de consulta. Un administrador o solicitante debe
                  responder.
                </p>
              )
            ) : null}

            {nextStep.action === 'quotations' ? (
              <Link
                to={`/portal/${customerId}/quotations`}
                className="mt-3 inline-flex h-7 items-center rounded-lg border border-blue-200 bg-white px-3 text-[8px] font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Ver cotizaciones
              </Link>
            ) : null}
          </div>

          {latestResponse && !openInformationRequest ? (
            <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2.5">
              <span className="mt-0.5 text-[10px] text-emerald-600">✓</span>
              <div>
                <p className="text-[8px] font-semibold text-emerald-800">
                  Última respuesta registrada
                </p>
                <p className="mt-0.5 text-[8px] leading-4 text-emerald-700">
                  {formatCustomerRequestDateTime(latestResponse.respondedAt ?? '')}
                </p>
              </div>
            </div>
          ) : null}

          <dl className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[8px] text-slate-500">Expediente</dt>
              <dd className="truncate text-[9px] font-semibold text-slate-900">
                {request.jobCase.caseNumber}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[8px] text-slate-500">Solicitada por</dt>
              <dd className="truncate text-[9px] font-semibold text-slate-900">
                {request.requestedByName}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[8px] text-slate-500">Referencia</dt>
              <dd className="truncate text-[9px] font-semibold text-slate-900">
                {request.customerReference ?? 'Sin referencia'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[8px] text-slate-500">Última actualización</dt>
              <dd className="text-right text-[8px] font-medium text-slate-700">
                {formatCustomerRequestDateTime(request.updatedAt)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  )
}
