import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  QualityInspectionDto,
  QualityMeasurementDto,
  SaveQualityMeasurementPayload,
  StartQualityInspectionPayload,
} from '../types/quality.types'

export async function handoffWorkOrderToQuality(
  workOrderId: number,
): Promise<QualityInspectionDto> {
  const response = await apiClient.post<ApiResponse<QualityInspectionDto>>(
    `/work-orders/${workOrderId}/quality-handoff`,
  )

  return response.data.data
}

export async function startQualityInspection(
  inspectionId: number,
  payload: StartQualityInspectionPayload = {},
): Promise<QualityInspectionDto> {
  const response = await apiClient.post<ApiResponse<QualityInspectionDto>>(
    `/quality-inspections/${inspectionId}/start`,
    payload,
  )

  return response.data.data
}

export async function addQualityMeasurement(
  inspectionId: number,
  payload: SaveQualityMeasurementPayload,
): Promise<QualityMeasurementDto> {
  const response = await apiClient.post<ApiResponse<QualityMeasurementDto>>(
    `/quality-inspections/${inspectionId}/measurements`,
    payload,
  )

  return response.data.data
}

export async function updateQualityMeasurement(
  inspectionId: number,
  measurementId: number,
  payload: SaveQualityMeasurementPayload,
): Promise<QualityMeasurementDto> {
  const response = await apiClient.put<ApiResponse<QualityMeasurementDto>>(
    `/quality-inspections/${inspectionId}/measurements/${measurementId}`,
    payload,
  )

  return response.data.data
}

export async function completeQualityInspection(
  inspectionId: number,
): Promise<QualityInspectionDto> {
  const response = await apiClient.post<ApiResponse<QualityInspectionDto>>(
    `/quality-inspections/${inspectionId}/complete`,
  )

  return response.data.data
}
