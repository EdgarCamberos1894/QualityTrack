import type {
  CustomerDocumentDto,
  CustomerDocumentSource,
} from '../types/customerDocument.types'

const sourceLabels: Record<CustomerDocumentSource, string> = {
  CUSTOMER_UPLOAD: 'Documento de solicitud',
  DELIVERY_EVIDENCE: 'Evidencia de entrega',
}

export function getCustomerDocumentSourceLabel(
  source: CustomerDocumentSource,
): string {
  return sourceLabels[source]
}

export function formatCustomerDocumentDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatCustomerDocumentFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function matchesCustomerDocumentSearch(
  document: CustomerDocumentDto,
  search: string,
): boolean {
  const normalized = search.trim().toLocaleLowerCase()
  if (!normalized) return true

  return [
    document.name,
    document.documentType,
    document.requestNumber,
    document.requestTitle,
    document.currentVersion.fileName,
  ].some((value) => value.toLocaleLowerCase().includes(normalized))
}
