import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  DocumentCenterDto,
  RequestDocumentVersionDto,
} from '../types/documentCenter.types'

export async function getDocumentCenter(): Promise<DocumentCenterDto[]> {
  const response =
    await apiClient.get<ApiResponse<DocumentCenterDto[]>>('/documents')

  return response.data.data
}

export async function getDocumentVersions(
  document: Pick<DocumentCenterDto, 'customerId' | 'requestId' | 'id'>,
): Promise<RequestDocumentVersionDto[]> {
  const response = await apiClient.get<
    ApiResponse<RequestDocumentVersionDto[]>
  >(
    `/customers/${document.customerId}/requests/${document.requestId}/documents/${document.id}/versions`,
  )

  return response.data.data
}

export async function getDocumentContent(
  document: Pick<DocumentCenterDto, 'customerId' | 'requestId' | 'id'>,
  versionId: number,
  download = false,
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/customers/${document.customerId}/requests/${document.requestId}/documents/${document.id}/versions/${versionId}/content`,
    {
      params: download ? { download: true } : undefined,
      responseType: 'blob',
    },
  )

  return response.data
}
