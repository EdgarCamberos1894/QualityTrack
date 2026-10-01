import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import { getWorkOrder360Snapshot } from '../model/workOrder360Presenter'
import type { WorkOrder360Dto } from '../types/workOrder360.types'
import { WorkOrderOriginChain } from './WorkOrderOriginChain'

interface WorkOrderSummaryProps {
  data: WorkOrder360Dto
}

function DataItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[9px] font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-[11px] font-semibold text-slate-950">{value}</dd>
    </div>
  )
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail?: string
}) {
  return (
    <div className="px-4 py-4">
      <p className="text-[9px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
      {detail ? (
        <p className="mt-1 text-[9px] text-slate-500">{detail}</p>
      ) : null}
    </div>
  )
}

export function WorkOrderSummary({ data }: WorkOrderSummaryProps) {
  const snapshot = getWorkOrder360Snapshot(data)
  const closedNonConformities = data.nonConformities.filter(
    (item) => item.status === 'CLOSED',
  ).length
  const openNonConformities =
    data.nonConformities.length - closedNonConformities

  return (
    <div className="space-y-4">
      <WorkOrderOriginChain data={data} />

      <div className="grid gap-4 @4xl/page:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-950">
            Snapshot operativo
          </h2>

          <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 @3xl/page:grid-cols-3">
            <DataItem
              label="Cliente"
              value={data.workOrder.source.customerName}
            />
            <DataItem
              label="Cantidad"
              value={`${data.workOrder.plannedQuantity ?? data.workOrder.source.quantity} piezas`}
            />
            <DataItem label="Material" value={snapshot.material} />
            <DataItem label="Lote" value={snapshot.lot} />
            <DataItem label="Plano usado" value={snapshot.pinnedDocument} />
            <DataItem label="Cotización" value={snapshot.quotation} />
            <DataItem
              label="Routing producción"
              value={snapshot.productionRouting}
            />
            <DataItem
              label="Routing retrabajo"
              value={snapshot.reworkRouting}
            />
          </dl>
        </Card>

        <Card
          className={
            snapshot.complete
              ? 'border-emerald-200 bg-emerald-50/40 p-5'
              : 'border-blue-200 bg-blue-50/40 p-5'
          }
        >
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            Estado de trazabilidad
          </p>
          <h2 className="mt-2 text-sm font-semibold text-slate-950">
            {snapshot.complete
              ? 'EXPEDIENTE COMPLETO'
              : 'EXPEDIENTE EN PROGRESO'}
          </h2>
          <p className="mt-2 text-[10px] leading-5 text-slate-600">
            {snapshot.complete
              ? 'Solicitud, cotización, ejecución, Calidad y Entrega están vinculadas con historial auditable.'
              : `${snapshot.completedStages} de ${snapshot.stages.length} etapas principales ya tienen una resolución terminal.`}
          </p>

          <div className="mt-5 rounded-lg border border-white/80 bg-white/80 px-4 py-3">
            <p className="text-[9px] text-slate-500">Eventos registrados</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {data.timeline.length}
            </p>
          </div>
        </Card>
      </div>

      <Card className="grid overflow-hidden sm:grid-cols-2 @3xl/page:grid-cols-4 @3xl/page:divide-x @3xl/page:divide-slate-200">
        <Metric label="Documentos vigentes" value={data.documents.length} />
        <Metric label="Eventos registrados" value={data.timeline.length} />
        <Metric label="Inspecciones" value={data.qualityInspections.length} />
        <Metric
          label="No conformidades"
          value={data.nonConformities.length}
          detail={
            data.nonConformities.length > 0
              ? `${closedNonConformities} cerradas · ${openNonConformities} abiertas`
              : 'Sin NC registradas'
          }
        />
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-950">
          Resultado por etapa
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 @4xl/page:grid-cols-5">
          {snapshot.stages.map((stage) => (
            <div
              key={stage.label}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
            >
              <p className="text-[9px] font-medium text-slate-500">
                {stage.label}
              </p>
              <div className="mt-2">
                <Badge tone={stage.tone} className="text-[9px]">
                  {stage.value}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
