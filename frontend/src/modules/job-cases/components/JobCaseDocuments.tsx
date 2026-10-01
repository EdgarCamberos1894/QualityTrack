import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { RequestDocumentDto } from '../types/jobCase.types'

interface JobCaseDocumentsProps {
  documents: RequestDocumentDto[]
}

export function JobCaseDocuments({ documents }: JobCaseDocumentsProps) {
  if (documents.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <EmptyState
          title="Sin documentos"
          description="La solicitud todavía no tiene documentos disponibles para revisión."
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Archivos de origen
        </p>
        <div className="mt-0.5 flex items-center justify-between gap-3">
          <h2 className="text-[12px] font-semibold text-slate-950">
            Documentos de la solicitud
          </h2>
          <span className="text-[8px] text-slate-400">{documents.length} archivos</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {documents.map((document) => (
          <article
            id={`document-${document.id}`}
            key={document.id}
            className="scroll-mt-24 px-4 py-3 target:bg-blue-50/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-wide text-blue-600">
                  {document.documentType}
                </p>
                <h3 className="mt-0.5 truncate text-[11px] font-semibold text-slate-950">
                  {document.name}
                </h3>
                <p className="mt-0.5 truncate text-[8px] text-slate-400">
                  {document.currentVersion.fileName}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-medium text-slate-500">
                v{document.currentVersion.version}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
