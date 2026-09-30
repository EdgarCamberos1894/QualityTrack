import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  attachDeliveryEvidence,
  cancelDelivery,
  completeDelivery,
  createDelivery,
  dispatchDelivery,
} from '../api/deliveries.api'
import type {
  AttachDeliveryEvidencePayload,
  CancelDeliveryPayload,
  CompleteDeliveryPayload,
  CreateDeliveryPayload,
  DispatchDeliveryPayload,
} from '../types/delivery.types'
import { deliveryKeys } from './useDeliveries'
import { workOrderKeys } from './useWorkOrders'

export function useDeliveryMutations() {
  const queryClient = useQueryClient()

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workOrderKeys.all }),
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all }),
    ])
  }

  const create = useMutation({
    mutationFn: ({
      workOrderId,
      payload,
    }: {
      workOrderId: number
      payload: CreateDeliveryPayload
    }) => createDelivery(workOrderId, payload),
    onSuccess: refresh,
  })

  const dispatch = useMutation({
    mutationFn: ({
      deliveryId,
      payload,
    }: {
      deliveryId: number
      payload: DispatchDeliveryPayload
    }) => dispatchDelivery(deliveryId, payload),
    onSuccess: refresh,
  })

  const complete = useMutation({
    mutationFn: ({
      deliveryId,
      payload,
    }: {
      deliveryId: number
      payload: CompleteDeliveryPayload
    }) => completeDelivery(deliveryId, payload),
    onSuccess: refresh,
  })

  const attachEvidence = useMutation({
    mutationFn: ({
      deliveryId,
      payload,
    }: {
      deliveryId: number
      payload: AttachDeliveryEvidencePayload
    }) => attachDeliveryEvidence(deliveryId, payload),
    onSuccess: refresh,
  })

  const cancel = useMutation({
    mutationFn: ({
      deliveryId,
      payload,
    }: {
      deliveryId: number
      payload: CancelDeliveryPayload
    }) => cancelDelivery(deliveryId, payload),
    onSuccess: refresh,
  })

  return { create, dispatch, complete, attachEvidence, cancel }
}
