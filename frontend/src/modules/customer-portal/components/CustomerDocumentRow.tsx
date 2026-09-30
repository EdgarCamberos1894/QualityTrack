import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  formatCustomerDocumentDate,
  formatCustomerDocumentFileSize,
  getCustomerDocumentSourceLabel,
} from '../model/customerDocumentPresenter'
import type { CustomerDocumentDto } from '../types/customerDocument.types'

interface CustomerDocumentRowProps {
  customerId: number
  document: CustomerDocumentDto
  busy: boolean
  onOpen: () => void
  onDownload: () => void
}

export function CustomerDocumentRow({
  customerId,
  document,
  busy,
  onOpen,
  onDownload,
}: CustomerDocumentRowProps) {
  return (
    <article className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 lg:grid-cols-[minmax(0,1.35fr)_180px_minmax(180px,0.9fr)_90px_150px_auto] lg:items-center">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-950">
          {document.name}
        </p>
        <p className="mt-1 truncate text-[10px] text-slate-500">
          {document.currentVersion.fileName} ·{' '}
          {formatCustomerDocumentFileSize(document.currentVersion.fileSize)}
        </p>
      </div>

      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
          Tipo
        </p>
        <p className="mt-1 text-[10px] font-medium text-slate-700 lg:mt-0">
          {document.documentType}
        </p>
        <p className="mt-1 text-[9px] text-slate-500">
          {getCustomerDocumentSourceLabel(document.source)}
        </p>
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
          Solicitud
        </p>
        <Link
          to={`/portal/${customerId}/requests/${document.requestId}`}
          className="mt-1 block truncate text-[10px] font-semibold text-blue-700 hover:underline lg:mt-0"
        >
          {document.requestNumber}
        </Link>
        <p className="mt-1 truncate text-[9px] text-slate-500">
          {document.requestTitle}
        </p>
      </div>

      <div>
        <Badge tone="info">v{document.currentVersion.version}</Badge>
      </div>

      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 lg:hidden">
          Actualizado
        </p>
        <p className="mt-1 text-[10px] text-slate-600 lg:mt-0">
          {formatCustomerDocumentDate(document.currentVersion.uploadedAt)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        <Button size="sm" variant="secondary" disabled={busy} onClick={onOpen}>
          Ver
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={onDownload}
        >
          Descargar
        </Button>
      </div>
    </article>
  )
}
