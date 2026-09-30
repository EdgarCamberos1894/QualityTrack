import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type {
  WorkOrder360DocumentDto,
  WorkOrderDocumentContext,
} from '../types/workOrder360.types'

interface WorkOrderDocumentsProps {
  documents: WorkOrder360DocumentDto[]
}

const contextLabels: Record<WorkOrderDocumentContext, string> = {
  CASE: 'Expediente',
  WORK_ORDER: 'Orden de trabajo',
  MATERIAL: 'Material',
  DELIVERY: 'Entrega',
}

function contextSummary({
  document,
}: WorkOrder360DocumentDto): string {
  if (document.materialLotNumbers.length > 0) {
    return `Lote ${document.materialLotNumbers.join(', ')}`
  }

  if (document.deliveryIds.length > 0) {
    return `Entrega #${document.deliveryIds.join(', #')}`
  }

  return document.contexts
    .map((context) => contextLabels[context])
    .join(' · ')
}

export function WorkOrderDocuments({ documents }: WorkOrderDocumentsProps) {
  if (documents.length === 0) {
    return (
      <EmptyState
        title="Sin documentos"
        description="La vista 360 todavía no tiene documentos asociados al expediente o a sus recursos operativos."
      />
    )
  }

  return (
    <div className="grid gap-3">
      {documents.map((entry) => {
        const { document, versions } = entry

        return (
          <article
            id={`document-${document.id}`}
            key={document.id}
            className="scroll-mt-24 rounded-xl border border-[#d9e2ee] bg-white p-4 target:ring-2 target:ring-blue-300"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-600">
                    {document.documentType}
                  </p>
                  {document.caseId === null ? (
                    <Badge tone="neutral">Recurso global</Badge>
                  ) : null}
                </div>
                <h2 className="mt-1 text-sm font-semibold text-slate-950">
                  {document.name}
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  {document.currentVersion.fileName}
                </p>
                <p className="mt-1 text-[9px] font-medium text-slate-400">
                  {contextSummary(entry)}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[10px] font-semibold text-slate-700">
                  Versión vigente · {document.currentVersion.version}
                </p>
                <p className="mt-1 text-[9px] text-slate-500">
                  {versions.length} versiones registradas
                </p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
