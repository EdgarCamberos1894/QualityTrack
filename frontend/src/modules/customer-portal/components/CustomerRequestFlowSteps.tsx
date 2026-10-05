import { WorkProgressSteps } from '@/shared/components/workflow/WorkProgressSteps'
import type { CustomerRequestStatus } from '../types/customerRequest.types'

interface CustomerRequestFlowStepsProps {
  status: CustomerRequestStatus
  deliveryProgress?: 'IN_TRANSIT' | 'PARTIAL' | 'DELIVERED'
  variant?: 'light' | 'dark'
  quotationHref?: string
  deliveryHref?: string
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
  quotationHref,
  deliveryHref,
}: CustomerRequestFlowStepsProps) {
  const stepHrefs: Partial<Record<number, string>> = {}
  const stepDetails: Partial<Record<number, string>> = {
    0: 'Origen del trabajo',
    2: 'Preparación interna',
    3: 'Fabricación',
    4: 'Inspección',
  }

  if (quotationHref) {
    stepHrefs[1] = quotationHref
    stepDetails[1] = 'Abrir propuesta'
  } else {
    stepDetails[1] = 'Propuesta comercial'
  }

  if (deliveryHref && deliveryProgress) {
    stepHrefs[5] = deliveryHref
    stepDetails[5] = 'Ver seguimiento'
  } else {
    stepDetails[5] = 'Cierre del trabajo'
  }

  return (
    <WorkProgressSteps
      currentStep={deliveryProgress ? 5 : activeStep(status)}
      cancelled={status === 'CANCELLED'}
      deliveryComplete={deliveryProgress === 'DELIVERED'}
      variant={variant}
      stepHrefs={stepHrefs}
      stepDetails={stepDetails}
    />
  )
}
