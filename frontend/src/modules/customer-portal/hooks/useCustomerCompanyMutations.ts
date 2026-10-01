import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  cancelCustomerInvitation,
  createCustomerInvitation,
  removeCustomerMember,
  updateCustomerCompany,
} from '../api/customerCompany.api'
import type {
  CreateCustomerInvitationPayload,
  UpdateCustomerCompanyPayload,
} from '../types/customerCompany.types'
import { customerCompanyKeys } from './useCustomerCompany'

export function useCustomerCompanyMutations(customerId: number) {
  const queryClient = useQueryClient()

  const updateCompany = useMutation({
    mutationFn: (payload: UpdateCustomerCompanyPayload) =>
      updateCustomerCompany(customerId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerCompanyKeys.detail(customerId),
      })
    },
  })

  const invite = useMutation({
    mutationFn: (payload: CreateCustomerInvitationPayload) =>
      createCustomerInvitation(customerId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerCompanyKeys.invitations(customerId),
      })
    },
  })

  const cancelInvitation = useMutation({
    mutationFn: (invitationId: number) =>
      cancelCustomerInvitation(customerId, invitationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerCompanyKeys.invitations(customerId),
      })
    },
  })

  const removeMember = useMutation({
    mutationFn: (userId: number) => removeCustomerMember(customerId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerCompanyKeys.members(customerId),
      })
    },
  })

  return { updateCompany, invite, cancelInvitation, removeMember }
}
