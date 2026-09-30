import type { WorkOrder360Dto } from '../types/workOrder360.types'

interface WorkOrderOriginChainProps {
  data: WorkOrder360Dto
}

export function WorkOrderOriginChain({ data }: WorkOrderOriginChainProps) {
  const { workOrder } = data
  const latestDelivery = [...data.deliveries]
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    )
    .at(-1)

  const nodes = [
    workOrder.source.requestNumber,
    workOrder.source.caseNumber,
    `${workOrder.agreement.quotationNumber} · R${workOrder.agreement.revision}`,
    workOrder.workOrderNumber,
    latestDelivery ? `Entrega #${latestDelivery.id}` : null,
  ].filter((value): value is string => value !== null)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-[15px] font-semibold text-slate-950">
        Un trabajo, una historia completa
      </h2>
      <p className="mt-1 text-[11px] leading-5 text-slate-500">
        Desde la solicitud del cliente hasta la recepción final, todos los
        registros permanecen vinculados a esta OT.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {nodes.map((node, index) => (
          <div key={node} className="contents">
            <span
              className={
                node === workOrder.workOrderNumber
                  ? 'rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-[9px] font-semibold text-blue-700'
                  : 'rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-[9px] font-medium text-slate-700'
              }
            >
              {node}
            </span>
            {index < nodes.length - 1 ? (
              <span className="text-xs font-semibold text-slate-400">→</span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
