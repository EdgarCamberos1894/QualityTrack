import { useRef, useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useCustomerRequestDocumentFileActions } from '../hooks/useCustomerRequestDocumentFileActions'
import {
  formatCustomerRequestDateTime,
  formatFileSize,
} from '../model/customerRequestPresenter'
import type {
  RequestDocumentDto,
  RequestDocumentVersionDto,
} from '../types/customerRequest.types'
import { RequestDocumentDialog } from './RequestDocumentDialog'
import { RequestDocumentHistoryDialog } from './RequestDocumentHistoryDialog'

interface CustomerRequestDocumentsProps {
  customerId: number
  requestId: number
  documents: RequestDocumentDto[]
  canModify: boolean
  adding: boolean
  addingVersion: boolean
  removing: boolean
  mutationError: unknown
  onAddDocument: Parameters<typeof RequestDocumentDialog>[0]['onSubmit']
  onAddVersion: (documentId: number, file: File) => Promise<boolean>
  onRemove: (documentId: number) => Promise<boolean>
  onResetErrors: () => void
}

export function CustomerRequestDocuments({
  customerId,
  requestId,
  documents,
  canModify,
  adding,
  addingVersion,
  removing,
  mutationError,
  onAddDocument,
  onAddVersion,
  onRemove,
  onResetErrors,
}: CustomerRequestDocumentsProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [history, setHistory] = useState<RequestDocumentDto | null>(null)
  const [removeId, setRemoveId] = useState<number | null>(null)
  const files = useCustomerRequestDocumentFileActions(customerId, requestId)
  const versionInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  return (
    <>
      <Card className="p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">Documentos</h2>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              Consulta la versión vigente, descarga archivos y revisa su
              historial.
            </p>
          </div>

          {canModify ? (
            <Button
              size="sm"
              onClick={() => {
                onResetErrors()
                files.clearError()
                setAddOpen(true)
              }}
            >
              Agregar documento
            </Button>
          ) : null}
        </div>

        {files.error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {getErrorMessage(files.error)}
          </p>
        ) : null}

        {documents.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-500">
            No hay documentos adjuntos a esta solicitud.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {documents.map((documentItem) => {
              const version = documentItem.currentVersion
              const confirmingRemove = removeId === documentItem.id

              return (
                <article
                  key={documentItem.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-950">
                        {documentItem.name}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {version.fileName} · Versión {version.version} ·{' '}
                        {formatFileSize(version.fileSize)}
                      </p>
                      <p className="mt-1 text-[9px] text-slate-400">
                        Actualizada{' '}
                        {formatCustomerRequestDateTime(version.uploadedAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={files.busyVersionId === version.id}
                        onClick={() =>
                          void files.openVersion(documentItem.id, version)
                        }
                      >
                        {files.busyVersionId === version.id
                          ? 'Abriendo…'
                          : 'Ver'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={files.busyVersionId === version.id}
                        onClick={() =>
                          void files.downloadVersion(documentItem.id, version)
                        }
                      >
                        Descargar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setHistory(documentItem)}
                      >
                        Historial
                      </Button>

                      {canModify ? (
                        <>
                          <input
                            ref={(element) => {
                              versionInputRefs.current[documentItem.id] =
                                element
                            }}
                            type="file"
                            className="sr-only"
                            onChange={(event) => {
                              const file = event.target.files?.[0]
                              if (file) {
                                void onAddVersion(documentItem.id, file)
                              }
                              event.target.value = ''
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={addingVersion}
                            onClick={() =>
                              versionInputRefs.current[documentItem.id]?.click()
                            }
                          >
                            Nueva versión
                          </Button>

                          {confirmingRemove ? (
                            <>
                              <Button
                                size="sm"
                                variant="danger"
                                disabled={removing}
                                onClick={() => {
                                  void onRemove(documentItem.id).then(
                                    (removed) => {
                                      if (removed) setRemoveId(null)
                                    },
                                  )
                                }}
                              >
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setRemoveId(null)}
                              >
                                No quitar
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setRemoveId(documentItem.id)}
                            >
                              Quitar
                            </Button>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {mutationError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {getErrorMessage(mutationError)}
          </p>
        ) : null}
      </Card>

      <RequestDocumentDialog
        open={addOpen}
        submitting={adding}
        error={mutationError}
        onClose={() => setAddOpen(false)}
        onSubmit={onAddDocument}
      />

      <RequestDocumentHistoryDialog
        customerId={customerId}
        requestId={requestId}
        documentId={history?.id ?? null}
        documentName={history?.name ?? ''}
        busyVersionId={files.busyVersionId}
        onClose={() => setHistory(null)}
        onOpenVersion={(version) => {
          if (history) void files.openVersion(history.id, version)
        }}
        onDownloadVersion={(version) => {
          if (history) void files.downloadVersion(history.id, version)
        }}
      />
    </>
  )
}
