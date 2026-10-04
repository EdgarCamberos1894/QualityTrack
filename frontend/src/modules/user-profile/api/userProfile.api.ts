import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  ChangeOwnPasswordPayload,
  InternalProfileDto,
  UpdateOwnProfilePayload,
} from '../types/userProfile.types'

export async function getOwnInternalProfile(): Promise<InternalProfileDto> {
  const response = await apiClient.get<ApiResponse<InternalProfileDto>>(
    '/internal/users/me',
  )

  return response.data.data
}

export async function updateOwnInternalProfile(
  payload: UpdateOwnProfilePayload,
): Promise<InternalProfileDto> {
  const response = await apiClient.put<ApiResponse<InternalProfileDto>>(
    '/internal/users/me',
    payload,
  )

  return response.data.data
}

export async function changeOwnInternalPassword(
  payload: ChangeOwnPasswordPayload,
): Promise<void> {
  await apiClient.put('/internal/users/me/password', payload)
}
