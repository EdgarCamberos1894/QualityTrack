import { WorkProgressSteps } from '@/shared/components/workflow/WorkProgressSteps'
import type { JobCaseStatus } from '../types/jobCase.types'

interface JobCaseFlowStepsProps {
  status: JobCaseStatus
  quotationId?: number | null
  workOrderId?: number | null
  workOrderStatus?: string | null
}

function workOrderStep(status?: string | null): number {
  switch (status) {
    case 'CREATED':
      return 2
    case 'READY_FOR_PRODUCTION':
    case 'IN_PRODUCTION':
      return 3
    case 'QUALITY_PENDING':
    case 'QUALITY_HOLD':
    case 'REWORK_IN_PROGRESS':
      return 4
    case 'READY_FOR_DELIVERY':
    case 'DELIVERED':
      return 5
    default:
      return 3
  }
}

function activeStep(status: JobCaseStatus, workOrderStatus?: string | null): number {
  switch (status) {
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'WAITING_CUSTOMER_INFO':
      return 0
    case 'READY_FOR_QUOTATION':
      return 1
    case 'AWAITING_WORK_ORDER':
      return 2
    case 'IN_PRODUCTION':
      return workOrderStep(workOrderStatus)
    case 'COMPLETED':
      return 5
    case 'CANCELLED':
      return 0
  }
}

export function JobCaseFlowSteps({
  status,
  quotationId = null,
  workOrderId = null,
  workOrderStatus = null,
}: JobCaseFlowStepsProps) {
  const stepHrefs: Partial<Record<number, string>> = {
    0: '#request-source',
  }

  if (quotationId !== null) {
    stepHrefs[1] = `/quotations/${quotationId}`
  }

  if (workOrderId !== null) {
    stepHrefs[2] = `/work-orders/${workOrderId}`
    stepHrefs[3] = `/work-orders/${workOrderId}?view=production`
    stepHrefs[4] = `/work-orders/${workOrderId}?view=quality`
    stepHrefs[5] = `/work-orders/${workOrderId}?view=delivery`
  }

  return (
    <WorkProgressSteps
      currentStep={activeStep(status, workOrderStatus)}
      cancelled={status === 'CANCELLED'}
      deliveryComplete={
        status === 'COMPLETED' || workOrderStatus === 'DELIVERED'
      }
      stepHrefs={stepHrefs}
    />
  )
}
