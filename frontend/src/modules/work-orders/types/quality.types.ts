import type { WorkOrderStatus } from './workOrder.types'

export type QualityInspectionStatus =
  'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'

export type QualityMeasurementResult = 'PASS' | 'FAIL'
export type NonConformityStatus = 'OPEN' | 'CLOSED'
export type NonConformityDisposition = 'REWORK' | 'SCRAP' | 'USE_AS_IS'

export interface QualityMeasurementDto {
  id: number
  characteristic: string
  nominalValue: number
  lowerLimit: number
  upperLimit: number
  measuredValue: number
  unit: string
  result: QualityMeasurementResult
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface NonConformitySummaryDto {
  id: number
  number: string
  status: NonConformityStatus
  affectedQuantity: number | null
  severity: string | null
  description: string | null
  disposition: NonConformityDisposition | null
  openedAt: string
  closedAt: string | null
}

export interface QualityInspectionDto {
  id: number
  workOrderId: number
  workOrderNumber: string
  status: QualityInspectionStatus
  reworkNonConformityId: number | null
  inspectorId: number | null
  inspectorName: string | null
  startedAt: string | null
  completedAt: string | null
  measurements: QualityMeasurementDto[]
  nonConformity: NonConformitySummaryDto | null
  createdAt: string
  updatedAt: string
}

export interface NonConformityDto {
  id: number
  number: string
  workOrderId: number
  workOrderNumber: string
  workOrderStatus: WorkOrderStatus
  originalInspectionId: number
  status: NonConformityStatus
  affectedQuantity: number | null
  severity: string | null
  description: string | null
  disposition: NonConformityDisposition | null
  openedByUserId: number
  openedByName: string | null
  openedAt: string
  resolvedByUserId: number | null
  resolvedByName: string | null
  closedAt: string | null
  resolutionNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface ScrapResolutionDto {
  nonConformity: NonConformityDto
  acceptedQuantityBeforeScrap: number
  affectedQuantity: number
  remainingAcceptedQuantity: number
  plannedQuantity: number
  readyForDelivery: boolean
}

export interface StartQualityInspectionPayload {
  inspectorId?: number
}

export interface SaveQualityMeasurementPayload {
  characteristic: string
  nominalValue: number
  lowerLimit: number
  upperLimit: number
  measuredValue: number
  unit: string
  notes?: string
}

export interface UpdateNonConformityPayload {
  affectedQuantity: number
  severity: string
  description: string
}

export interface AuthorizeUseAsIsPayload {
  reason: string
}
