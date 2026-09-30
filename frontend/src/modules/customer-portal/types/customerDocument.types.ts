import type { RequestDocumentVersionDto } from './customerRequest.types'

export type CustomerDocumentSource = 'CUSTOMER_UPLOAD' | 'DELIVERY_EVIDENCE'

export interface CustomerDocumentDto {
  id: number
  caseId: number
  requestId: number
  requestNumber: string
  requestTitle: string
  documentType: string
  name: string
  description: string | null
  source: CustomerDocumentSource
  createdAt: string
  currentVersion: RequestDocumentVersionDto
}
