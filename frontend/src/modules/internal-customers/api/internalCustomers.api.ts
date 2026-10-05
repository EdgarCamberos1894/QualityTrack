import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  InternalCustomerDetailDto,
  InternalCustomerJobCasePageDto,
  InternalCustomerJobCaseQuery,
  InternalCustomerSummaryDto,
} from '../types/internalCustomer.types'

export async function getInternalCustomers(): Promise<
  InternalCustomerSummaryDto[]
> {
  const response = await apiClient.get<ApiResponse<InternalCustomerSummaryDto[]>>(
    '/internal/customers',
  )

  return response.data.data
}

export async function getInternalCustomer(
  customerId: number,
): Promise<InternalCustomerDetailDto> {
  const response = await apiClient.get<ApiResponse<InternalCustomerDetailDto>>(
    `/internal/customers/${customerId}`,
  )

  return response.data.data
}

export async function getInternalCustomerJobCases(
  customerId: number,
  query: InternalCustomerJobCaseQuery,
): Promise<InternalCustomerJobCasePageDto> {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
  })

  const search = query.search.trim()
  if (search) params.set('search', search)
  if (query.status !== 'ALL') params.set('status', query.status)
  if (query.assignment !== 'ALL') {
    params.set('assigned', String(query.assignment === 'ASSIGNED'))
  }

  const response = await apiClient.get<ApiResponse<InternalCustomerJobCasePageDto>>(
    `/internal/customers/${customerId}/job-cases?${params.toString()}`,
  )

  return response.data.data
}
