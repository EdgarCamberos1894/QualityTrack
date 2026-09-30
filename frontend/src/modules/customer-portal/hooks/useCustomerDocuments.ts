import { useQuery } from '@tanstack/react-query'
import { getCustomerDocuments } from '../api/customerDocuments.api'

export const customerDocumentKeys = {
  all: ['customer-documents'] as const,
  list: (customerId: number) =>
    [...customerDocumentKeys.all, customerId] as const,
}

export function useCustomerDocuments(customerId: number) {
  return useQuery({
    queryKey: customerDocumentKeys.list(customerId),
    queryFn: () => getCustomerDocuments(customerId),
  })
}
