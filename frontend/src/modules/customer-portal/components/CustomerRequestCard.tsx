import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import {
  formatCustomerRequestDate,
  getCustomerRequestStatusPresentation,
  requestNeedsCustomerResponse,
} from '../model/customerRequestPresenter'
import type { CustomerRequestSummaryDto } from '../types/customerRequest.types'

interface CustomerRequestCardProps {
  customerId: number
  request: CustomerRequestSummaryDto
}

export function CustomerRequestCard({
  customerId,
  request,
}: CustomerRequestCardProps) {
  const status = getCustomerRequestStatusPresentation(request.jobCase.status)
  const needsResponse = requestNeedsCustomerResponse(request)

  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <span
        className={
          needsResponse
            ? 'absolute inset-y-0 left-0 w-1 bg-amber-600'
            : request.jobCase.status === 'CANCELLED'
              ? 'absolute inset-y-0 left-0 w-1 bg-red-600'
              : request.jobCase.status === 'COMPLETED'
                ? 'absolute inset-y-0 left-0 w-1 bg-emerald-600'
                : 'absolute inset-y-0 left-0 w-1 bg-blue-600'
        }
      />

      <div className="grid gap-5 p-5 pl-6 lg:grid-cols-[minmax(0,1fr)_190px_160px] lg:items-center">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-slate-500">
            {request.requestNumber}
            {request.customerReference
              ? ` · Ref. ${request.customerReference}`
              : ''}
          </p>
          <h2 className="mt-1 truncate text-base font-semibold text-slate-950">
            {request.title}
          </h2>
          <p className="mt-2 text-[11px] text-slate-600">
            {request.quantity} pieza{request.quantity === 1 ? '' : 's'} ·{' '}
            {request.materialRequirementType === 'SPECIFIED'
              ? request.materialRequirement
              : 'Asesoría técnica requerida'}{' '}
            · Requerida{' '}
            {formatCustomerRequestDate(request.requestedDeliveryDate)}
          </p>
        </div>

        <div>
          <Badge tone={status.tone}>{status.label}</Badge>
          <p className="mt-2 text-[10px] text-slate-500">
            Etapa · {status.stage}
          </p>
        </div>

        <div className="flex lg:justify-end">
          <Link
            to={`/portal/${customerId}/requests/${request.id}`}
            className={
              needsResponse
                ? 'inline-flex h-10 min-w-36 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white transition hover:bg-blue-700'
                : 'inline-flex h-10 min-w-36 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50'
            }
          >
            {needsResponse ? 'Responder' : 'Ver detalle'}
          </Link>
        </div>
      </div>
    </article>
  )
}
