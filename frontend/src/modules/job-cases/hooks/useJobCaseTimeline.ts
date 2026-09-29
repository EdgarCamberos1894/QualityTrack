import { useQuery } from '@tanstack/react-query'
import { getJobCaseTimeline } from '../api/jobCases.api'
import { jobCaseKeys } from './useJobCases'

export function useJobCaseTimeline(caseId: number | null) {
  return useQuery({
    queryKey: jobCaseKeys.timeline(caseId),
    queryFn: () => getJobCaseTimeline(caseId as number),
    enabled: caseId !== null,
  })
}
