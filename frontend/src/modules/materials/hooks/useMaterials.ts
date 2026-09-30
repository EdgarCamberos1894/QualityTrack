import { useQuery } from '@tanstack/react-query'
import { getMaterialLots, getMaterials } from '../api/materials.api'

export const materialKeys = {
  all: ['materials'] as const,
  list: () => [...materialKeys.all, 'list'] as const,
  lots: (materialId: number | null) =>
    [...materialKeys.all, 'lots', materialId] as const,
}

export function useMaterials(enabled = true) {
  return useQuery({
    queryKey: materialKeys.list(),
    queryFn: getMaterials,
    enabled,
  })
}

export function useMaterialLots(materialId: number | null) {
  return useQuery({
    queryKey: materialKeys.lots(materialId),
    queryFn: () => getMaterialLots(materialId as number),
    enabled: materialId !== null,
  })
}
