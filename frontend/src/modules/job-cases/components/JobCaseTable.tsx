import { Link } from 'react-router-dom'
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            <th className="px-4 py-3">Expediente</th>
            <th className="px-4 py-3">Solicitud</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Responsable</th>
            <th className="px-4 py-3">Entrega solicitada</th>
            <th className="px-4 py-3 text-right">Acción</th>
          </tr>
        </thead>

        <tbody>
          {jobCases.map((jobCase) => {
            const status = getJobCaseStatusPresentation(jobCase.status)

            return (
              <tr
                key={jobCase.id}
                className="border-b border-slate-100 text-xs text-slate-700 last:border-0 hover:bg-slate-50"
              >
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-950">
                    {jobCase.caseNumber}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {jobCase.request.title}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-800">
                    {jobCase.request.requestNumber}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Cantidad · {jobCase.request.quantity}
                  </p>
                </td>
                <td className="px-4 py-4">{jobCase.request.customerName}</td>
                <td className="px-4 py-4">
                  <Badge tone={status.tone} className="text-[10px]">
                    {status.label}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  {jobCase.assignedToName ?? 'Sin asignar'}
                </td>
                <td className="px-4 py-4">
                  {formatJobCaseDate(jobCase.request.requestedDeliveryDate)}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    to={`/job-cases/${jobCase.id}`}
                    className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
