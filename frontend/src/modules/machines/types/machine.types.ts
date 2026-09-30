export const MACHINE_STATUSES = [
  'AVAILABLE',
  'IN_USE',
  'MAINTENANCE',
  'OUT_OF_SERVICE',
] as const

export type MachineStatus = (typeof MACHINE_STATUSES)[number]

export interface MachineDto {
  id: number
  code: string
  name: string
  type: string
  status: MachineStatus
  createdAt: string
  updatedAt: string
}
