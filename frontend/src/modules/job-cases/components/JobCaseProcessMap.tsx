import { Link } from 'react-router-dom'

interface RelatedQuotation {
  id: number
  quotationNumber: string
  revision: number
  status: string
}

interface RelatedWorkOrder {
  id: number
  workOrderNumber: string
  status: string
}

interface JobCaseProcessMapProps {
  requestNumber: string
  quotation: RelatedQuotation | null
  workOrder: RelatedWorkOrder | null
}

interface ProcessNodeProps {
  eyebrow: string
  title: string
  description: string
  href?: string
  actionLabel?: string
  state: 'complete' | 'current' | 'pending'
}

function operationalStage(workOrder: RelatedWorkOrder | null): {
  title: string
  description: string
  href?: string
  state: ProcessNodeProps['state']
} {
  if (!workOrder) {
    return {
      title: 'Etapa operativa pendiente',
      description: 'Se habilitará cuando exista una orden de trabajo.',
      state: 'pending',
    }
  }

  switch (workOrder.status) {
    case 'CREATED':
      return {
        title: 'Preparación de la orden',
        description: 'Planificación, documentos, material y hoja de ruta.',
        href: `/work-orders/${workOrder.id}?view=preparation`,
        state: 'current',
      }
    case 'READY_FOR_PRODUCTION':
    case 'IN_PRODUCTION':
      return {
        title: 'Producción',
        description: 'La ejecución continúa desde la orden de trabajo.',
        href: `/work-orders/${workOrder.id}?view=production`,
        state: 'current',
      }
    case 'QUALITY_PENDING':
    case 'QUALITY_HOLD':
    case 'REWORK_IN_PROGRESS':
      return {
        title: 'Calidad',
        description: 'Inspecciones, liberación o retrabajo del producto.',
        href: `/work-orders/${workOrder.id}?view=quality`,
        state: 'current',
      }
    case 'READY_FOR_DELIVERY':
      return {
        title: 'Entrega',
        description: 'El trabajo quedó liberado para despacho.',
        href: `/work-orders/${workOrder.id}?view=delivery`,
        state: 'current',
      }
    case 'DELIVERED':
      return {
        title: 'Entrega completada',
        description: 'La operación terminó; el expediente conserva el historial.',
        href: `/work-orders/${workOrder.id}?view=delivery`,
        state: 'complete',
      }
    case 'CANCELLED':
      return {
        title: 'Orden cancelada',
        description: 'La orden se cerró sin completar el recorrido operativo.',
        href: `/work-orders/${workOrder.id}`,
        state: 'complete',
      }
    default:
      return {
        title: 'Orden de trabajo',
        description: 'Consulta el estado operativo directamente en la orden.',
        href: `/work-orders/${workOrder.id}`,
        state: 'current',
      }
  }
}

function ProcessNode({
  eyebrow,
  title,
  description,
  href,
  actionLabel = 'Abrir',
  state,
}: ProcessNodeProps) {
  const markerClass =
    state === 'complete'
      ? 'bg-emerald-600 text-white'
      : state === 'current'
        ? 'bg-blue-600 text-white'
        : 'border border-slate-300 bg-white text-slate-400'

  return (
    <article className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-[0_10px_28px_-26px_rgba(15,23,42,0.25)]">
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${markerClass}`}
        >
          {state === 'complete' ? '✓' : state === 'current' ? '●' : '○'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400">
            {eyebrow}
          </p>
          <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-950">
            {title}
          </p>
          <p className="mt-1 text-[8px] leading-4 text-slate-500">
            {description}
          </p>
          {href ? (
            <Link
              to={href}
              className="mt-2 inline-flex h-6 items-center rounded-md border border-slate-200 bg-white px-2 text-[7px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {actionLabel} →
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function JobCaseProcessMap({
  requestNumber,
  quotation,
  workOrder,
}: JobCaseProcessMapProps) {
  const operation = operationalStage(workOrder)
  const quotationComplete = quotation?.status === 'APPROVED' || workOrder !== null

  return (
    <section className="rounded-xl border border-blue-100/80 bg-gradient-to-r from-white via-white to-blue-50/35 p-3.5 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.22)]">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Expediente 360
          </p>
          <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
            Mapa del caso
          </h2>
        </div>
        <p className="max-w-xl text-[8px] leading-4 text-slate-500 sm:text-right">
          El expediente conserva el contexto. Las acciones se ejecutan en el recurso que corresponde a cada etapa.
        </p>
      </div>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <ProcessNode
          eyebrow="Origen"
          title={requestNumber}
          description="Solicitud original, documentos y requerimiento del cliente."
          href="#request-source"
          actionLabel="Ver origen"
          state="complete"
        />

        <ProcessNode
          eyebrow="Acuerdo comercial"
          title={
            quotation
              ? `${quotation.quotationNumber} · Rev. ${quotation.revision}`
              : 'Cotización pendiente'
          }
          description={
            quotation
              ? `Estado comercial: ${quotation.status.toLocaleLowerCase('es-MX').replaceAll('_', ' ')}.`
              : 'Todavía no existe una propuesta comercial vinculada.'
          }
          href={quotation ? `/quotations/${quotation.id}` : undefined}
          actionLabel="Abrir cotización"
          state={quotation ? (quotationComplete ? 'complete' : 'current') : 'pending'}
        />

        <ProcessNode
          eyebrow="Ejecución"
          title={workOrder?.workOrderNumber ?? 'Orden de trabajo pendiente'}
          description={
            workOrder
              ? 'La ejecución operativa vive en esta orden, no en el expediente.'
              : quotationComplete
                ? 'La propuesta ya permite continuar hacia Operación.'
                : 'Se habilitará después de la aprobación comercial.'
          }
          href={workOrder ? `/work-orders/${workOrder.id}` : undefined}
          actionLabel="Abrir orden"
          state={workOrder ? 'complete' : 'pending'}
        />

        <ProcessNode
          eyebrow="Etapa actual"
          title={operation.title}
          description={operation.description}
          href={operation.href}
          actionLabel="Ir a la etapa"
          state={operation.state}
        />
      </div>
    </section>
  )
}
