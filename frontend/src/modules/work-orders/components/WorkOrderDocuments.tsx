import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { WorkOrder360DocumentDto } from '../types/workOrder360.types'

interface WorkOrderDocumentsProps {
  documents: WorkOrder360DocumentDto[]
}

export function WorkOrderDocuments({ documents }: WorkOrderDocumentsProps) {
  if (documents.length === 0) {
    return (
      <EmptyState
        title="Sin documentos"
        description="El expediente 360 todavía no tiene documentos asociados."
      />
    )
  }

  return (
    <div className="grid gap-3">
      {documents.map(({ document, versions }) => (
        <article
          id={`document-${document.id}`}
          key={document.id}
          className="scroll-mt-24 rounded-xl border border-[#d9e2ee] bg-white p-4 target:ring-2 target:ring-blue-300"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-600">
                {document.documentType}
              </p>
              <h2 className="mt-1 text-sm font-semibold text-slate-950">
                {document.name}
              </h2>
              <p className="mt-1 text-[10px] text-slate-500">
                {document.currentVersion.fileName}
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
      ))}
    </div>
  )
}
