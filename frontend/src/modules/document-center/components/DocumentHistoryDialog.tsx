import { Button } from '@/shared/components/ui/Button'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { useDocumentVersions } from '../hooks/useDocumentCenter'
import {
  formatDocumentDateTime,
  formatDocumentFileSize,
} from '../model/documentCenterPresenter'
import type { DocumentCenterDto } from '../types/documentCenter.types'

interface DocumentHistoryDialogProps {
  document: DocumentCenterDto | null
  busyVersionId: number | null
  onClose: () => void
  onOpenVersion: (versionId: number) => void
  onDownloadVersion: (versionId: number, fileName: string) => void
}

export function DocumentHistoryDialog({
  document,
  busyVersionId,
  onClose,
  onOpenVersion,
  onDownloadVersion,
}: DocumentHistoryDialogProps) {
  const query = useDocumentVersions(document)

  if (!document) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-history-title"
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">
            Historial de versiones
          </p>
          <h2
            id="document-history-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            {document.name}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {document.customerName} · {document.requestNumber}
          </p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {query.isPending ? (
            <LoadingState label="Cargando versiones…" />
          ) : query.isError ? (
            <ErrorState
              error={query.error}
              title="No pudimos cargar el historial"
            />
          ) : (
            <div className="space-y-3">
              {query.data.map((version) => (
                <article
                  key={version.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-950">
                        Versión {version.version} · {version.fileName}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {formatDocumentFileSize(version.fileSize)} ·{' '}
                        {formatDocumentDateTime(version.uploadedAt)}
                      </p>
                      <p className="mt-1 text-[9px] text-slate-400">
                        {version.uploadedByName}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyVersionId === version.id}
                        onClick={() => onOpenVersion(version.id)}
                      >
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyVersionId === version.id}
                        onClick={() =>
                          onDownloadVersion(version.id, version.fileName)
                        }
                      >
                        Descargar
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </section>
    </div>
  )
}
