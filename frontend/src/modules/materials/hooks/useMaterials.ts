import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMaterial,
  createMaterialLot,
  getMaterialLots,
  getMaterials,
} from '../api/materials.api'
import type {
  CreateMaterialLotPayload,
  CreateMaterialPayload,
} from '../types/material.types'

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

export function useMaterialMutations() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: CreateMaterialPayload) => createMaterial(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: materialKeys.list() })
    },
  })

  const createLot = useMutation({
    mutationFn: ({
      materialId,
      payload,
    }: {
      materialId: number
      payload: CreateMaterialLotPayload
    }) => createMaterialLot(materialId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: materialKeys.lots(variables.materialId),
      })
    },
  })

  return { create, createLot }
}
