import { useQuery } from '@tanstack/react-query'
import { getMachines } from '../api/machines.api'

export const machineKeys = {
  all: ['machines'] as const,
  list: () => [...machineKeys.all, 'list'] as const,
}

export function useMachines(enabled = true) {
  return useQuery({
    queryKey: machineKeys.list(),
    queryFn: getMachines,
    enabled,
  })
}
