import type { MaterialLotDto, WorkOrderMaterialDto } from '@/modules/materials'
import type { DeliveryDto } from './delivery.types'
import type { NonConformityDto, QualityInspectionDto } from './quality.types'
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
  nonConformities: NonConformityDto[]
  documents: WorkOrder360DocumentDto[]
  deliveries: DeliveryDto[]
  timeline: TraceabilityEventDto[]
}

export type { QualityInspectionDto } from './quality.types'
