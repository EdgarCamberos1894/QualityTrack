import { Badge } from '@/shared/components/ui/Badge'
import { getJobCaseStatusPresentation } from '../model/jobCasePresenter'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseDetailHeaderProps {
  jobCase: JobCaseDetailDto
}

export function JobCaseDetailHeader({ jobCase }: JobCaseDetailHeaderProps) {
  const status = getJobCaseStatusPresentation(jobCase.status)

  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[10px] text-slate-500">
          Expedientes / Revisión interna
        </p>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight text-slate-950">
          {jobCase.caseNumber}
        </h1>
        <p className="mt-1 text-[13px] font-medium text-slate-700">
          {jobCase.request.title} · {jobCase.request.customerName}
        </p>
      </div>

      <div className="sm:text-right">
        <Badge tone={status.tone} className="px-4 py-1.5 text-[10px]">
          {status.label}
        </Badge>
        <p className="mt-2 text-[9px] text-slate-500">
          Responsable · {jobCase.assignedToName ?? 'Sin asignar'}
        </p>
      </div>
    </div>
  )
}
