import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  formatDocumentDateTime,
  formatDocumentFileSize,
  getDocumentContextSummary,
  getDocumentSourceLabel,
} from '../model/documentCenterPresenter'
import type { DocumentCenterDto } from '../types/documentCenter.types'

interface DocumentCenterRowProps {
  document: DocumentCenterDto
  busy: boolean
  onOpen: () => void
  onHistory: () => void
}

export function DocumentCenterRow({
  document,
  busy,
  onOpen,
  onHistory,
}: DocumentCenterRowProps) {
  return (
    <article className="grid gap-4 border-b border-slate-100 px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(220px,1.4fr)_190px_minmax(170px,1fr)_90px_170px_150px] lg:items-center">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-950">
          {document.name}
        </p>
        <p className="mt-1 truncate text-[10px] text-slate-500">
          {document.currentVersion.fileName} ·{' '}
          {formatDocumentFileSize(document.currentVersion.fileSize)}
        </p>
        <p className="mt-1 truncate text-[9px] text-slate-400">
          {getDocumentSourceLabel(document)}
        </p>
      </div>

      <div>
        <Badge tone="neutral">{document.documentType}</Badge>
      </div>

      <div>
        <p className="text-[10px] font-semibold text-slate-700">
          {getDocumentContextSummary(document)}
        </p>
        {document.caseId && document.caseNumber ? (
          <Link
            to={`/job-cases/${document.caseId}?tab=documents#document-${document.id}`}
            className="mt-1 inline-flex text-[9px] font-semibold text-blue-600 hover:underline"
          >
            {document.caseNumber}
          </Link>
        ) : (
          <Link
            to="/resources"
            className="mt-1 inline-flex text-[9px] font-semibold text-blue-600 hover:underline"
          >
            Recursos · Materiales
          </Link>
        )}
      </div>

      <p className="text-[10px] font-semibold text-slate-700">
        v{document.currentVersion.version}
      </p>

      <div>
        <p className="text-[10px] text-slate-700">
          {formatDocumentDateTime(document.currentVersion.uploadedAt)}
        </p>
        <p className="mt-1 truncate text-[9px] text-slate-400">
          {document.currentVersion.uploadedByName}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        <Button size="sm" variant="secondary" disabled={busy} onClick={onOpen}>
          Ver
        </Button>
        <Button size="sm" variant="ghost" onClick={onHistory}>
          Historial
        </Button>
      </div>
    </article>
  )
}
