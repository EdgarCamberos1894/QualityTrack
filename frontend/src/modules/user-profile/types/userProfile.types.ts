import type { SystemRole } from '@/modules/auth'

export type InternalProfileStatus =
  | 'PENDING_VERIFICATION'
  | 'PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'SUSPENDED'

export interface InternalProfileDto {
  id: number
  firstName: string
  lastName: string
  email: string
  status: InternalProfileStatus
  roles: SystemRole[]
  createdAt: string
  updatedAt: string
}

export interface UpdateOwnProfilePayload {
  firstName: string
  lastName: string
}

export interface ChangeOwnPasswordPayload {
  currentPassword: string
  newPassword: string
}
