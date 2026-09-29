import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { RequestDocumentDto } from '../types/jobCase.types'

interface JobCaseDocumentsProps {
  documents: RequestDocumentDto[]
}

export function JobCaseDocuments({ documents }: JobCaseDocumentsProps) {
  if (documents.length === 0) {
    return (
      <EmptyState
        title="Sin documentos"
        description="La solicitud todavía no tiene documentos disponibles para revisión."
      />
    )
  }

  return (
    <div className="grid gap-3">
      {documents.map((document) => (
        <article
          key={document.id}
          className="rounded-xl border border-[#d9e2ee] bg-white p-4"
        >
          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-600">
            {document.documentType}
          </p>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">
                {document.name}
              </h2>
              <p className="mt-1 text-[10px] text-slate-500">
                {document.currentVersion.fileName}
              </p>
            </div>
            <p className="text-[10px] font-medium text-slate-600">
              Versión {document.currentVersion.version}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}
