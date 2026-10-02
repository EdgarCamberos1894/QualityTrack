import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import {
  formatJobCaseDate,
  getJobCaseStatusPresentation,
} from '../model/jobCasePresenter'
import type { JobCaseDto } from '../types/jobCase.types'

interface JobCaseTableProps {
  jobCases: JobCaseDto[]
}

export function JobCaseTable({ jobCases }: JobCaseTableProps) {
  return (
    <div className="divide-y divide-slate-100">
      {jobCases.map((jobCase) => {
        const status = getJobCaseStatusPresentation(jobCase.status)

        return (
          <article
            key={jobCase.id}
            className="group grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-4 py-3 transition hover:bg-blue-50/30 sm:px-5 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(155px,0.8fr)_minmax(125px,0.7fr)_auto] md:items-center"
          >
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <SidebarNavIcon name="cases" className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <Link
                    to={`/job-cases/${jobCase.id}`}
                    className="block truncate text-[11px] font-semibold text-slate-950 transition group-hover:text-blue-700"
                  >
                    {jobCase.caseNumber}
                  </Link>
                  <p className="mt-0.5 truncate text-[8px] text-slate-400">
                    {jobCase.request.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end md:order-last">
              <OpenAction to={`/job-cases/${jobCase.id}`} label="Abrir" />
            </div>

            <div className="col-span-2 min-w-0 md:col-span-1">
              <p className="truncate text-[9px] font-medium text-slate-700">
                {jobCase.request.customerName}
              </p>
              <p className="mt-0.5 truncate text-[7px] text-slate-400">
                {jobCase.request.requestNumber} · {jobCase.request.quantity} piezas
              </p>
            </div>

            <div className="col-span-2 min-w-0 md:col-span-1">
              <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
                {status.label}
              </Badge>
              <p className="mt-1 truncate text-[7px] text-slate-400">
                {jobCase.assignedToName ?? 'Sin asignar'}
              </p>
            </div>

            <div className="col-span-2 md:col-span-1">
              <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                Entrega solicitada
              </p>
              <p className="mt-1 text-[9px] font-medium text-slate-700">
                {formatJobCaseDate(jobCase.request.requestedDeliveryDate)}
              </p>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function OpenAction({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      {label}
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 10h8" />
        <path d="m11 7 3 3-3 3" />
      </svg>
    </Link>
  )
}
