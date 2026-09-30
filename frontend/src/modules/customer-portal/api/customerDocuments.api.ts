import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type { CustomerDocumentDto } from '../types/customerDocument.types'

export async function getCustomerDocuments(
  customerId: number,
): Promise<CustomerDocumentDto[]> {
  const response = await apiClient.get<ApiResponse<CustomerDocumentDto[]>>(
    `/customers/${customerId}/documents`,
  )

  return response.data.data
}

export async function getCustomerDocumentContent(
  customerId: number,
  requestId: number,
  documentId: number,
  versionId: number,
  download = false,
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/customers/${customerId}/requests/${requestId}/documents/${documentId}/versions/${versionId}/content`,
    {
      params: download ? { download: true } : undefined,
      responseType: 'blob',
    },
  )

  return response.data
}
