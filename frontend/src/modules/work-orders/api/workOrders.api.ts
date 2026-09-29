import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type { WorkOrder360Dto, WorkOrderDto } from '../types/workOrder.types'

export async function getWorkOrders(): Promise<WorkOrderDto[]> {
  const response =
    await apiClient.get<ApiResponse<WorkOrderDto[]>>('/work-orders')

  return response.data.data
}

export async function getWorkOrder360(
  workOrderId: number,
): Promise<WorkOrder360Dto> {
  const response = await apiClient.get<ApiResponse<WorkOrder360Dto>>(
    `/work-orders/${workOrderId}/360`,
  )

  return response.data.data
}
