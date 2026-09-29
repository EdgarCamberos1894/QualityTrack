import type { WorkOrderDetailDto } from '../types/workOrder.types'

interface WorkOrderOriginChainProps {
  workOrder: WorkOrderDetailDto
  eventCount: number
}

export function WorkOrderOriginChain({
  workOrder,
  eventCount,
}: WorkOrderOriginChainProps) {
  const source = workOrder.source
  const agreement = workOrder.agreement

  return (
    <section className="rounded-[10px] border border-[#d9e2ee] bg-white px-4 py-3">
      <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-blue-600">
        Cadena de origen
      </p>
      <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-[11px] font-semibold text-slate-950">
          {source.requestNumber} → {source.caseNumber} →{' '}
          {agreement.quotationNumber} · Rev {agreement.revision} →{' '}
          {workOrder.workOrderNumber}
        </p>
        <p className="shrink-0 text-[10px] text-slate-500">
          Auditoría completa · {eventCount} eventos
        </p>
      </div>
    </section>
  )
}
