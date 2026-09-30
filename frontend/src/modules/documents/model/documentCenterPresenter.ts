import type {
  DocumentCenterDto,
  DocumentContext,
} from '../types/documentCenter.types'

export type DocumentContextFilter = 'ALL' | DocumentContext

const contextLabels: Record<DocumentContext, string> = {
  CASE: 'Expediente',
  WORK_ORDER: 'Orden de trabajo',
  MATERIAL: 'Material',
  DELIVERY: 'Entrega',
}

export function getDocumentContextLabel(context: DocumentContext): string {
  return contextLabels[context]
}

export function getDocumentPrimaryContext(document: DocumentCenterDto): string {
  const preferred = ['WORK_ORDER', 'MATERIAL', 'DELIVERY'] as const

  for (const context of preferred) {
    const reference = document.references.find(
      (item) => item.context === context,
    )
    if (reference) return reference.label
  }

  return document.caseNumber
}

export function getDocumentPrimaryHref(document: DocumentCenterDto): string {
  const workOrder = document.references.find(
    (reference) => reference.context === 'WORK_ORDER',
  )

  if (workOrder) {
    return `/work-orders/${workOrder.resourceId}?tab=documents#document-${document.id}`
  }

  return `/job-cases/${document.caseId}?tab=documents#document-${document.id}`
}

export function documentMatchesSearch(
  document: DocumentCenterDto,
  search: string,
): boolean {
  const term = search.trim().toLocaleLowerCase()
  if (!term) return true

  const values = [
    document.name,
    document.documentType,
    document.customerName,
    document.caseNumber,
    document.requestNumber,
    document.currentVersion.fileName,
    document.createdByName,
    ...document.references.map((reference) => reference.label),
  ]

  return values.some((value) => value.toLocaleLowerCase().includes(term))
}

export function formatDocumentUpdatedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatDocumentFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
