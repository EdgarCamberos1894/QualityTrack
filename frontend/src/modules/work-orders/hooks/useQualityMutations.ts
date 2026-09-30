import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addQualityMeasurement,
  completeQualityInspection,
  handoffWorkOrderToQuality,
  startQualityInspection,
  updateQualityMeasurement,
} from '../api/quality.api'
import type {
  SaveQualityMeasurementPayload,
  StartQualityInspectionPayload,
} from '../types/quality.types'
import { workOrderKeys } from './useWorkOrders'

export function useQualityMutations(workOrderId: number) {
  const queryClient = useQueryClient()

  const refreshWorkOrder = () =>
    queryClient.invalidateQueries({ queryKey: workOrderKeys.all })

  const handoff = useMutation({
    mutationFn: () => handoffWorkOrderToQuality(workOrderId),
    onSuccess: refreshWorkOrder,
  })

  const startInspection = useMutation({
    mutationFn: ({
      inspectionId,
      payload,
    }: {
      inspectionId: number
      payload?: StartQualityInspectionPayload
    }) => startQualityInspection(inspectionId, payload),
    onSuccess: refreshWorkOrder,
  })

  const addMeasurement = useMutation({
    mutationFn: ({
      inspectionId,
      payload,
    }: {
      inspectionId: number
      payload: SaveQualityMeasurementPayload
    }) => addQualityMeasurement(inspectionId, payload),
    onSuccess: refreshWorkOrder,
  })

  const updateMeasurement = useMutation({
    mutationFn: ({
      inspectionId,
      measurementId,
      payload,
    }: {
      inspectionId: number
      measurementId: number
      payload: SaveQualityMeasurementPayload
    }) => updateQualityMeasurement(inspectionId, measurementId, payload),
    onSuccess: refreshWorkOrder,
  })

  const completeInspection = useMutation({
    mutationFn: (inspectionId: number) =>
      completeQualityInspection(inspectionId),
    onSuccess: refreshWorkOrder,
  })

  return {
    handoff,
    startInspection,
    addMeasurement,
    updateMeasurement,
    completeInspection,
  }
}
