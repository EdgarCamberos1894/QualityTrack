import type {
  MaterialLotDto,
  WorkOrderMaterialDto,
} from '@/modules/materials'
import type {
  ProductionStatusDto,
  RoutingSheetDto,
  WorkOrderDetailDto,
} from './workOrder.types'

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

export interface WorkOrder360MaterialDto {
  consumption: WorkOrderMaterialDto
  lot: MaterialLotDto
}

export interface WorkOrder360Dto {
  workOrder: WorkOrderDetailDto
  quotationRevisions: unknown[]
  routingSheets: RoutingSheetDto[]
  production: ProductionStatusDto
  materials: WorkOrder360MaterialDto[]
  qualityInspections: QualityInspectionDto[]
  nonConformities: unknown[]
  documents: WorkOrder360DocumentDto[]
  deliveries: DeliveryDto[]
  timeline: TraceabilityEventDto[]
}
