import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type { MachineDto } from '../types/machine.types'

export async function getMachines(): Promise<MachineDto[]> {
  const response =
    await apiClient.get<ApiResponse<MachineDto[]>>('/machines')

  return response.data.data
}
