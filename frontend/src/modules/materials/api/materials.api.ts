import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  MaterialDto,
  MaterialLotDto,
  RecordMaterialConsumptionPayload,
  WorkOrderMaterialDto,
} from '../types/material.types'

export async function getMaterials(): Promise<MaterialDto[]> {
  const response = await apiClient.get<ApiResponse<MaterialDto[]>>('/materials')

  return response.data.data
}

export async function getMaterialLots(
  materialId: number,
): Promise<MaterialLotDto[]> {
  const response = await apiClient.get<ApiResponse<MaterialLotDto[]>>(
    `/materials/${materialId}/lots`,
  )

  return response.data.data
}

export async function recordMaterialConsumption(
  workOrderId: number,
  payload: RecordMaterialConsumptionPayload,
): Promise<WorkOrderMaterialDto> {
  const response = await apiClient.post<ApiResponse<WorkOrderMaterialDto>>(
    `/work-orders/${workOrderId}/materials`,
    payload,
  )

  return response.data.data
}
