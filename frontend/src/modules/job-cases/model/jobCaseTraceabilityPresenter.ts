import type {
  JobCaseTimelineEventDto,
  JobCaseTraceabilityActionDto,
} from '../types/jobCase.types'

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function metadataString(
  event: JobCaseTimelineEventDto,
  key: string,
): string | null {
  const value = event.metadata[key]
  return typeof value === 'string' && value.trim() ? value : null
}

function workOrderIdFor(event: JobCaseTimelineEventDto): number | null {
  const action = event.actions?.find(
    (item) => item.type === 'VIEW_WORK_ORDER',
  )

  return action?.resourceId ?? asNumber(event.metadata.workOrderId)
}

function documentIdFor(event: JobCaseTimelineEventDto): number | null {
  const action = event.actions?.find((item) => item.type === 'VIEW_DOCUMENT')
  return action?.resourceId ?? asNumber(event.metadata.documentId)
}

function workOrderHref(
  event: JobCaseTimelineEventDto,
  view: 'preparation' | 'production' | 'quality' | 'delivery' | 'documents',
  anchor?: string,
): string | null {
  const workOrderId = workOrderIdFor(event)
  if (workOrderId === null) return null

  return `/work-orders/${workOrderId}?view=${view}${
    anchor ? `#${anchor}` : ''
  }`
}

export function getJobCaseTraceabilityActionHref(
  action: JobCaseTraceabilityActionDto,
  event: JobCaseTimelineEventDto,
  caseId: number,
): string | null {
  const routingPurpose = metadataString(event, 'routingPurpose')
  const rework = routingPurpose === 'REWORK'

  switch (action.type) {
    case 'VIEW_CUSTOMER_REQUEST':
      return `/job-cases/${caseId}#request-source`
    case 'VIEW_JOB_CASE':
      return action.resourceId === caseId
        ? null
        : `/job-cases/${action.resourceId}`
    case 'VIEW_QUOTATION':
      return `/quotations/${action.resourceId}`
    case 'VIEW_WORK_ORDER':
      return `/work-orders/${action.resourceId}`
    case 'VIEW_ROUTING_SHEET':
      return workOrderHref(
        event,
        rework ? 'quality' : 'preparation',
        `routing-sheet-${action.resourceId}`,
      )
    case 'VIEW_ROUTING_OPERATION':
      return workOrderHref(
        event,
        rework ? 'quality' : 'preparation',
        `routing-operation-${action.resourceId}`,
      )
    case 'VIEW_OPERATION_EXECUTION':
      return workOrderHref(
        event,
        rework ? 'quality' : 'production',
        `operation-execution-${action.resourceId}`,
      )
    case 'VIEW_DOCUMENT': {
      const workOrderId = workOrderIdFor(event)
      return workOrderId === null
        ? `/job-cases/${caseId}#document-${action.resourceId}`
        : workOrderHref(
            event,
            'documents',
            `document-${action.resourceId}`,
          )
    }
    case 'VIEW_DOCUMENT_VERSION': {
      const documentId = documentIdFor(event)
      const workOrderId = workOrderIdFor(event)

      if (documentId !== null) {
        return workOrderId === null
          ? `/job-cases/${caseId}#document-${documentId}`
          : workOrderHref(event, 'documents', `document-${documentId}`)
      }

      return workOrderId === null
        ? null
        : workOrderHref(event, 'documents')
    }
    case 'VIEW_MATERIAL_LOT':
      return workOrderHref(
        event,
        'production',
        `material-lot-${action.resourceId}`,
      )
    case 'VIEW_QUALITY_INSPECTION':
      return workOrderHref(
        event,
        'quality',
        `quality-inspection-${action.resourceId}`,
      )
    case 'VIEW_QUALITY_MEASUREMENT':
    case 'VIEW_QUALITY_CHECK':
      return workOrderHref(
        event,
        'quality',
        `quality-check-${action.resourceId}`,
      )
    case 'VIEW_NON_CONFORMITY':
      return workOrderHref(
        event,
        'quality',
        `non-conformity-${action.resourceId}`,
      )
    case 'VIEW_DELIVERY':
      return workOrderHref(
        event,
        'delivery',
        `delivery-${action.resourceId}`,
      )
    default:
      return null
  }
}

export function getPrimaryJobCaseTraceabilityHref(
  event: JobCaseTimelineEventDto,
  caseId: number,
): string | null {
  const actions = event.actions ?? []

  const navigable = actions
    .map((action) => ({
      action,
      href: getJobCaseTraceabilityActionHref(action, event, caseId),
    }))
    .filter(
      (
        item,
      ): item is {
        action: JobCaseTraceabilityActionDto
        href: string
      } => item.href !== null,
    )

  const specific = navigable.find(
    ({ action }) => action.type !== 'VIEW_JOB_CASE',
  )

  return specific?.href ?? navigable.at(0)?.href ?? null
}
