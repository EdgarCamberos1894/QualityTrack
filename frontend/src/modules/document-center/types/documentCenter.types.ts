export type DocumentContextDto = 'CASE' | 'WORK_ORDER' | 'MATERIAL' | 'DELIVERY'

export interface DocumentCenterVersionDto {
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

export interface RequestDocumentVersionDto extends DocumentCenterVersionDto {
  contentUrl: string
  downloadUrl: string
}

export interface DocumentReferenceDto {
  context: DocumentContextDto
  resourceId: number
  documentVersionId: number
  version: number
}

export interface DocumentCenterDto {
  id: number
  caseId: number
  requestId: number
  customerId: number
  customerName: string
  requestNumber: string
  caseNumber: string
  documentType: string
  name: string
  description: string | null
  createdByUserId: number
  createdByName: string
  createdAt: string
  currentVersion: DocumentCenterVersionDto
  contexts: DocumentContextDto[]
  workOrderIds: number[]
  workOrderNumbers: string[]
  materialLotIds: number[]
  materialLotNumbers: string[]
  deliveryIds: number[]
  references: DocumentReferenceDto[]
}
