import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type { CustomerDeliveryDto } from '../types/customerDelivery.types'

export async function getCustomerRequestDeliveries(
  customerId: number,
  requestId: number,
): Promise<CustomerDeliveryDto[]> {
  const response = await apiClient.get<ApiResponse<CustomerDeliveryDto[]>>(
    `/customers/${customerId}/requests/${requestId}/deliveries`,
  )

  return response.data.data
}
