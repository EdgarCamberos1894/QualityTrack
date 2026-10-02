import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import {
  formatJobCaseDate,
  formatJobCaseDateTime,
} from '../model/jobCasePresenter'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseSummaryProps {
  jobCase: JobCaseDetailDto
}

export function JobCaseSummary({ jobCase }: JobCaseSummaryProps) {
  return (
    <Card className="h-full border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/30 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.3)]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <SidebarNavIcon name="requests" className="h-[17px] w-[17px]" />
        </div>
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Información base
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
            Detalles de la solicitud
          </h2>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[8px] font-medium text-slate-500">Cantidad</p>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-950">
            {jobCase.request.quantity} pieza
            {jobCase.request.quantity === 1 ? '' : 's'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[8px] font-medium text-slate-500">Material</p>
          <p className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-4 text-slate-950">
            {jobCase.request.materialRequirementType === 'ASSISTANCE_REQUIRED'
              ? 'Asesoría técnica'
              : jobCase.request.materialRequirement ?? 'Sin especificar'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[8px] font-medium text-slate-500">
            Fecha requerida
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-950">
            {formatJobCaseDate(jobCase.request.requestedDeliveryDate)}
          </p>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Descripción
        </p>
        <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-5 text-slate-700">
          {jobCase.request.description?.trim() ||
            'El cliente no agregó una descripción adicional a la solicitud.'}
        </p>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Requisitos técnicos
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-[0.38fr_0.62fr]">
          <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
            <p className="text-[8px] text-slate-500">Definición</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-900">
              {jobCase.request.materialRequirementType === 'ASSISTANCE_REQUIRED'
                ? 'Asesoría técnica requerida'
                : 'Material especificado'}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
            <p className="text-[8px] text-slate-500">Detalle</p>
            <p className="mt-0.5 whitespace-pre-wrap text-[9px] leading-4 text-slate-700">
              {jobCase.request.materialRequirement ??
                'Pendiente de definición técnica'}
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
        <div className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-[8px] text-slate-500">Solicitud</dt>
          <dd className="truncate text-[9px] font-semibold text-slate-900">
            {jobCase.request.requestNumber}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-[8px] text-slate-500">Solicitada por</dt>
          <dd className="truncate text-[9px] font-semibold text-slate-900">
            {jobCase.request.requestedByName ?? 'Sin registrar'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-[8px] text-slate-500">Referencia</dt>
          <dd className="truncate text-[9px] font-semibold text-slate-900">
            {jobCase.request.customerReference ?? 'Sin referencia'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-[8px] text-slate-500">Enviada</dt>
          <dd className="text-right text-[8px] font-medium text-slate-700">
            {formatJobCaseDateTime(jobCase.request.submittedAt)}
          </dd>
        </div>
      </dl>
    </Card>
  )
}
