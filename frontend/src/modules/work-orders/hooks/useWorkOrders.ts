import { useQuery } from '@tanstack/react-query'
import { getWorkOrders } from '../api/workOrders.api'

export const workOrderKeys = {
  all: ['work-orders'] as const,
  list: () => [...workOrderKeys.all, 'list'] as const,
}

export function useWorkOrders() {
  return useQuery({
    queryKey: workOrderKeys.list(),
    queryFn: getWorkOrders,
  })
}
