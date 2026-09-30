import type { TraceabilityEventDto } from '../types/workOrder360.types'

export type TimelinePhase = 'commercial' | 'production' | 'quality' | 'delivery'

interface TimelinePhasePresentation {
  label: string
  dotClassName: string
  badgeClassName: string
}

const eventLabels: Record<string, string> = {
  REQUEST_SUBMITTED: 'Solicitud recibida',
  JOB_CASE_CREATED: 'Expediente creado',
  CUSTOMER_REQUEST_CANCELLED: 'Solicitud cancelada',
  DOCUMENT_ADDED: 'Documento agregado',
  DOCUMENT_VERSION_ADDED: 'Versión documental agregada',
  DOCUMENT_REMOVED: 'Documento retirado',
  JOB_CASE_STATUS_CHANGED: 'Estado del expediente actualizado',
  JOB_CASE_REVIEW_STARTED: 'Revisión del expediente iniciada',
  CUSTOMER_INFORMATION_REQUESTED: 'Información solicitada al cliente',
  CUSTOMER_INFORMATION_RESPONDED: 'Información respondida por el cliente',
  MATERIAL_SPECIFICATION_DEFINED: 'Especificación de material definida',
  JOB_CASE_READY_FOR_QUOTATION: 'Expediente listo para cotizar',
  QUOTATION_CREATED: 'Cotización creada',
  QUOTATION_SENT: 'Cotización enviada',
  QUOTATION_ADJUSTMENT_REQUESTED: 'Ajuste de cotización solicitado',
  QUOTATION_REVISION_CREATED: 'Revisión de cotización creada',
  QUOTATION_APPROVED: 'Cotización aprobada',
  QUOTATION_REJECTED: 'Cotización rechazada',
  QUOTATION_EXPIRED: 'Cotización expirada',
  QUOTATION_CANCELLED: 'Cotización cancelada',
  WORK_ORDER_CREATED: 'Orden de trabajo creada',
  WORK_ORDER_PLANNING_UPDATED: 'Planeación actualizada',
  WORK_ORDER_DOCUMENT_PINNED: 'Documento fijado a la orden',
  WORK_ORDER_CANCELLED: 'Orden de trabajo cancelada',
  ROUTING_SHEET_CREATED: 'Hoja de ruta creada',
  ROUTING_OPERATION_ADDED: 'Operación de ruta agregada',
  ROUTING_OPERATION_UPDATED: 'Operación de ruta actualizada',
  ROUTING_OPERATION_REMOVED: 'Operación de ruta retirada',
  ROUTING_SHEET_APPROVED: 'Hoja de ruta aprobada',
  ROUTING_SHEET_REOPENED: 'Hoja de ruta reabierta',
  ROUTING_SHEET_RELEASED: 'Hoja de ruta liberada',
  WORK_ORDER_RELEASED: 'Orden liberada a producción',
  PRODUCTION_STARTED: 'Producción iniciada',
  OPERATION_EXECUTION_STARTED: 'Operación iniciada',
  OPERATION_EXECUTION_COMPLETED: 'Operación completada',
  OPERATION_EXECUTION_CANCELLED: 'Intento de operación cancelado',
  WORK_ORDER_MATERIAL_RECORDED: 'Consumo de material registrado',
  PRODUCTION_COMPLETED: 'Producción completada',
  QUALITY_HANDOFF: 'Orden enviada a calidad',
  WORK_ORDER_QUALITY_APPROVED: 'Calidad aprobó la orden',
  WORK_ORDER_QUALITY_REJECTED: 'Calidad rechazó la orden',
  QUALITY_INSPECTION_CREATED: 'Inspección de calidad creada',
  QUALITY_INSPECTION_STARTED: 'Inspección iniciada',
  QUALITY_MEASUREMENT_RECORDED: 'Medición de calidad registrada',
  QUALITY_MEASUREMENT_UPDATED: 'Medición de calidad actualizada',
  QUALITY_INSPECTION_APPROVED: 'Inspección aprobada',
  QUALITY_INSPECTION_REJECTED: 'Inspección rechazada',
  NON_CONFORMITY_OPENED: 'No conformidad abierta',
  NON_CONFORMITY_DETAILS_UPDATED: 'Datos de no conformidad actualizados',
  NON_CONFORMITY_REWORK_SELECTED: 'Retrabajo seleccionado',
  NON_CONFORMITY_SCRAP_RECORDED: 'Descarte registrado',
  NON_CONFORMITY_USE_AS_IS_AUTHORIZED: 'Uso bajo concesión autorizado',
  NON_CONFORMITY_CLOSED: 'No conformidad cerrada',
  WORK_ORDER_NC_RESOLVED: 'No conformidad de la orden resuelta',
  REWORK_STARTED: 'Retrabajo iniciado',
  REWORK_COMPLETED: 'Retrabajo completado',
  REWORK_REINSPECTION_FAILED: 'Reinspección de retrabajo rechazada',
  DELIVERY_CREATED: 'Entrega creada',
  DELIVERY_DISPATCHED: 'Entrega despachada',
  DELIVERY_EVIDENCE_ATTACHED: 'Evidencia de entrega vinculada',
  DELIVERY_DELIVERED: 'Recepción confirmada',
  DELIVERY_CANCELLED: 'Entrega cancelada',
  WORK_ORDER_DELIVERED: 'Orden entregada',
}

const phasePresentation: Record<TimelinePhase, TimelinePhasePresentation> = {
  commercial: {
    label: 'Comercial',
    dotClassName: 'bg-blue-500',
    badgeClassName: 'bg-blue-50 text-blue-700',
  },
  production: {
    label: 'Producción',
    dotClassName: 'bg-violet-500',
    badgeClassName: 'bg-violet-50 text-violet-700',
  },
  quality: {
    label: 'Calidad',
    dotClassName: 'bg-amber-500',
    badgeClassName: 'bg-amber-50 text-amber-700',
  },
  delivery: {
    label: 'Entrega',
    dotClassName: 'bg-emerald-500',
    badgeClassName: 'bg-emerald-50 text-emerald-700',
  },
}

export function getTimelinePhase(event: TraceabilityEventDto): TimelinePhase {
  if (
    event.aggregateType === 'DELIVERY' ||
    event.eventType.startsWith('DELIVERY_') ||
    event.eventType === 'WORK_ORDER_DELIVERED'
  ) {
    return 'delivery'
  }

  if (
    event.aggregateType.startsWith('QUALITY_') ||
    event.aggregateType === 'NON_CONFORMITY' ||
    event.eventType.includes('QUALITY') ||
    event.eventType.includes('NON_CONFORMITY') ||
    event.eventType.startsWith('REWORK_')
  ) {
    return 'quality'
  }

  if (
    event.aggregateType === 'WORK_ORDER' ||
    event.aggregateType === 'ROUTING_SHEET' ||
    event.aggregateType === 'OPERATION_EXECUTION' ||
    event.eventType.includes('PRODUCTION') ||
    event.eventType.includes('ROUTING') ||
    event.eventType.includes('OPERATION_EXECUTION')
  ) {
    return 'production'
  }

  return 'commercial'
}

export function getTimelinePhasePresentation(
  phase: TimelinePhase,
): TimelinePhasePresentation {
  return phasePresentation[phase]
}

export function getTimelineEventLabel(eventType: string): string {
  const known = eventLabels[eventType]

  if (known) return known

  const normalized = eventType
    .toLocaleLowerCase('es-MX')
    .replaceAll('_', ' ')
    .replace(/^./, (character) => character.toLocaleUpperCase('es-MX'))

  return normalized
}

export function formatTimelineDate(value: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
