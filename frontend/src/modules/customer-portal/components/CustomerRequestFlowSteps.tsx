import { WorkProgressSteps } from '@/shared/components/workflow/WorkProgressSteps'
import type { CustomerRequestStatus } from '../types/customerRequest.types'

interface CustomerRequestFlowStepsProps {
  status: CustomerRequestStatus
  deliveryProgress?: 'IN_TRANSIT' | 'PARTIAL' | 'DELIVERED'
  variant?: 'light' | 'dark'
}

function activeStep(status: CustomerRequestStatus): number {
  switch (status) {
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'WAITING_CUSTOMER_INFO':
      return 0
    case 'READY_FOR_QUOTATION':
      return 1
    case 'IN_PRODUCTION':
      return 3
    case 'COMPLETED':
      return 5
    case 'CANCELLED':
      return 0
  }
}

export function CustomerRequestFlowSteps({
  status,
  deliveryProgress,
  variant = 'light',
}: CustomerRequestFlowStepsProps) {
  return (
    <WorkProgressSteps
      currentStep={deliveryProgress ? 5 : activeStep(status)}
      cancelled={status === 'CANCELLED'}
      deliveryComplete={deliveryProgress === 'DELIVERED'}
      variant={variant}
    />
  )
}
