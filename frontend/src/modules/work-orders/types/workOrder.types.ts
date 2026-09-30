export const WORK_ORDER_STATUSES = [
  'CREATED',
  'READY_FOR_PRODUCTION',
  'IN_PRODUCTION',
  'QUALITY_PENDING',
  'QUALITY_HOLD',
  'REWORK_IN_PROGRESS',
  'READY_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
] as const

export const WORK_ORDER_PRIORITIES = [
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT',
] as const

export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number]
export type WorkOrderPriority = (typeof WORK_ORDER_PRIORITIES)[number]

export interface WorkOrderDto {
  id: number
  caseId: number
  caseNumber: string
  requestId: number
  requestNumber: string
  customerId: number
  customerName: string
  workOrderNumber: string
  status: WorkOrderStatus
  priority: WorkOrderPriority
  plannedQuantity: number | null
  plannedStartDate: string | null
  plannedEndDate: string | null
  agreedDeliveryDate: string | null
  approvedQuotationId: number
  approvedQuotationNumber: string
  approvedQuotationRevision: number
  createdByUserId: number
  createdByName: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkOrderFiltersValue {
  search: string
  status: WorkOrderStatus | 'ALL'
  priority: WorkOrderPriority | 'ALL'
}

export interface WorkOrderDocumentDto {
  id: number
  documentId: number
  documentName: string
  documentType: string
  documentVersionId: number
  version: number
  fileName: string
  mimeType: string
  fileSize: number
  checksum: string
  linkedByUserId: number
  linkedByName: string | null
  linkedAt: string
}

export interface WorkOrderSourceDto {
  caseId: number
  caseNumber: string
  requestId: number
  requestNumber: string
  customerId: number
  customerName: string
  customerReference: string | null
  title: string
  description: string | null
  quantity: number
  materialRequirementType: string | null
  materialRequirement: string | null
  requestedDeliveryDate: string | null
  requestedByUserId: number
  requestedByName: string | null
  materialSpecification: unknown | null
  documents: unknown[]
  informationRequests: unknown[]
}

export interface WorkOrderAgreementDto {
  quotationId: number
  quotationNumber: string
  revision: number
  approvedAt: string | null
  estimatedDeliveryDate: string | null
}

export interface WorkOrderDetailDto {
  id: number
  workOrderNumber: string
  status: WorkOrderStatus
  priority: WorkOrderPriority
  plannedQuantity: number | null
  plannedStartDate: string | null
  plannedEndDate: string | null
  agreedDeliveryDate: string | null
  actualStartAt: string | null
  actualEndAt: string | null
  createdByUserId: number
  createdByName: string | null
  cancelledByUserId: number | null
  cancelledByName: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string
  updatedAt: string
  source: WorkOrderSourceDto
  agreement: WorkOrderAgreementDto
  pinnedDocuments: WorkOrderDocumentDto[]
}

export interface TraceabilitySnapshotDto {
  fromStatus: string | null
  toStatus: string | null
  details: Record<string, unknown>
}

export interface TraceabilityActionDto {
  type: string
  label: string
  resourceType: string
  resourceId: number
}

export interface TraceabilityEventDto {
  id: number
  aggregateType: string
  aggregateId: number
  eventType: string
  performedByUserId: number | null
  performedByName: string | null
  occurredAt: string
  snapshot: TraceabilitySnapshotDto
  actions: TraceabilityActionDto[]
}

export interface DocumentVersionDto {
  id: number
  version: number
  fileName: string
  mimeType: string
  fileSize: number
  checksum: string
  uploadedByUserId: number
  uploadedByName: string | null
  uploadedAt: string
}

export interface DocumentCenterDto {
  id: number
  documentType: string
  name: string
  description: string | null
  createdByName: string | null
  createdAt: string
  currentVersion: DocumentVersionDto
}

export interface WorkOrder360DocumentDto {
  document: DocumentCenterDto
  versions: DocumentVersionDto[]
}

export interface QualityInspectionDto {
  id: number
  workOrderId: number
  workOrderNumber: string
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'
  reworkNonConformityId: number | null
  inspectorId: number | null
  inspectorName: string | null
  startedAt: string | null
  completedAt: string | null
  measurements: unknown[]
  nonConformity: unknown | null
  createdAt: string
  updatedAt: string
}

export interface DeliveryDto {
  id: number
  workOrderId: number
  workOrderNumber: string
  quantity: number
  status: 'PENDING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'
  destinationRecipientName: string | null
  destinationAddress: string | null
  destinationCity: string | null
  destinationState: string | null
  destinationPostalCode: string | null
  destinationCountry: string | null
  deliveryMethod: string | null
  carrier: string | null
  trackingNumber: string | null
  dispatchedAt: string | null
  deliveredAt: string | null
  receivedByName: string | null
  createdAt: string
  updatedAt: string
}

export type RoutingSheetStatus = 'DRAFT' | 'APPROVED' | 'RELEASED'
export type RoutingPurpose = 'PRODUCTION' | 'REWORK'

export interface RoutingOperationDto {
  id: number
  sequenceNumber: number
  code: string
  name: string
  instructions: string | null
  estimatedMinutes: number
  createdAt: string
  updatedAt: string
}

export interface RoutingSheetDto {
  id: number
  workOrderId: number
  workOrderNumber: string
  workOrderStatus: WorkOrderStatus
  revision: number
  purpose: RoutingPurpose
  status: RoutingSheetStatus
  nonConformityId: number | null
  totalEstimatedMinutes: number
  operations: RoutingOperationDto[]
  createdByUserId: number
  createdByName: string | null
  approvedByUserId: number | null
  approvedByName: string | null
  approvedAt: string | null
  releasedByUserId: number | null
  releasedByName: string | null
  releasedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkOrder360Dto {
  workOrder: WorkOrderDetailDto
  quotationRevisions: unknown[]
  routingSheets: RoutingSheetDto[]
  production: unknown | null
  materials: unknown[]
  qualityInspections: QualityInspectionDto[]
  nonConformities: unknown[]
  documents: WorkOrder360DocumentDto[]
  deliveries: DeliveryDto[]
  timeline: TraceabilityEventDto[]
}

export type WorkOrderDetailTab =
  | 'summary'
  | 'preparation'
  | 'traceability'
  | 'documents'
  | 'quality'
  | 'delivery'

export interface CreateWorkOrderPayload {
  priority: WorkOrderPriority
  plannedStartDate: string
  plannedEndDate: string
}

export interface UpdateWorkOrderPlanningPayload {
  priority: WorkOrderPriority
  plannedStartDate: string
  plannedEndDate: string
}

export interface RoutingOperationPayload {
  sequenceNumber: number
  code: string
  name: string
  instructions: string
  estimatedMinutes: number
}

export interface ReopenRoutingSheetPayload {
  reason: string
}
