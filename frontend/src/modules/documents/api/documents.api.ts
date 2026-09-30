import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type { DocumentCenterDto } from '../types/documentCenter.types'

export async function getDocumentCenter(): Promise<DocumentCenterDto[]> {
  const response =
    await apiClient.get<ApiResponse<DocumentCenterDto[]>>('/documents')

  return response.data.data
}
