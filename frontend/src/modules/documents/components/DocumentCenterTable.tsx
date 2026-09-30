import { Link } from 'react-router-dom'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import {
  formatDocumentFileSize,
  formatDocumentUpdatedAt,
  getDocumentPrimaryContext,
  getDocumentPrimaryHref,
} from '../model/documentCenterPresenter'
import type { DocumentCenterDto } from '../types/documentCenter.types'

interface DocumentCenterTableProps {
  documents: DocumentCenterDto[]
}

export function DocumentCenterTable({ documents }: DocumentCenterTableProps) {
  if (documents.length === 0) {
    return (
      <EmptyState
        title="No encontramos documentos"
        description="Prueba otros filtros o un término de búsqueda diferente."
      />
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(240px,1.5fr)_minmax(150px,0.8fr)_minmax(180px,1fr)_90px_150px_72px] gap-4 border-b border-slate-200 px-5 py-3 text-[9px] font-semibold uppercase tracking-wide text-slate-500 lg:grid">
        <span>Documento</span>
        <span>Tipo</span>
        <span>Contexto</span>
        <span>Versión</span>
        <span>Actualizado</span>
        <span />
      </div>

      <div className="divide-y divide-slate-100">
        {documents.map((document) => (
          <article
            key={document.id}
            className="grid gap-4 px-5 py-4 transition hover:bg-slate-50/70 lg:grid-cols-[minmax(240px,1.5fr)_minmax(150px,0.8fr)_minmax(180px,1fr)_90px_150px_72px] lg:items-center"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-950">
                {document.name}
              </p>
              <p className="mt-1 truncate text-[9px] text-slate-500">
                {document.customerName} · {document.requestNumber} ·{' '}
                {document.currentVersion.fileName}
              </p>
              <p className="mt-1 text-[9px] text-slate-400">
                {formatDocumentFileSize(document.currentVersion.fileSize)}
              </p>
            </div>

            <p className="break-all text-[9px] font-semibold text-slate-600">
              {document.documentType}
            </p>

            <div>
              <p className="text-[10px] font-medium text-slate-700">
                {getDocumentPrimaryContext(document)}
              </p>
              <p className="mt-1 text-[9px] text-slate-400">
                {document.caseNumber}
              </p>
            </div>

            <Badge tone="info" className="w-fit">
              v{document.currentVersion.version}
            </Badge>

            <div>
              <p className="text-[9px] text-slate-600">
                {formatDocumentUpdatedAt(document.currentVersion.uploadedAt)}
              </p>
              <p className="mt-1 truncate text-[9px] text-slate-400">
                {document.currentVersion.uploadedByName}
              </p>
            </div>

            <Link
              to={getDocumentPrimaryHref(document)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Ver
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
