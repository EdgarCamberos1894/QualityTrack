export type DocumentContext = 'CASE' | 'WORK_ORDER' | 'MATERIAL' | 'DELIVERY'

export interface DocumentVersionDto {
  id: number
  version: number
  fileName: string
  mimeType: string
  fileSize: number
  checksum: string
  uploadedByUserId: number
  uploadedByName: string
  uploadedAt: string
}

export interface DocumentReferenceDto {
  context: DocumentContext
  resourceId: number
  documentVersionId: number
  version: number
  label: string
}

export interface DocumentCenterDto {
  id: number
  caseId: number
  caseNumber: string
  requestId: number
  requestNumber: string
  customerId: number
  customerName: string
  documentType: string
  name: string
  description: string | null
  createdByUserId: number
  createdByName: string
  createdAt: string
  currentVersion: DocumentVersionDto
  contexts: DocumentContext[]
  workOrderIds: number[]
  materialLotIds: number[]
  deliveryIds: number[]
  references: DocumentReferenceDto[]
}
