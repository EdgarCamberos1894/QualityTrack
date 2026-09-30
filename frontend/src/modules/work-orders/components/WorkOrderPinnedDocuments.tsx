import { useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import type {
  WorkOrder360DocumentDto,
  WorkOrderDocumentDto,
} from '../types/workOrder.types'

interface WorkOrderPinnedDocumentsProps {
  documents: WorkOrder360DocumentDto[]
  pinnedDocuments: WorkOrderDocumentDto[]
  canEdit: boolean
  saving: boolean
  error: unknown
  onPin: (documentId: number, versionId: number) => Promise<void>
}

export function WorkOrderPinnedDocuments({
  documents,
  pinnedDocuments,
  canEdit,
  saving,
  error,
  onPin,
}: WorkOrderPinnedDocumentsProps) {
  const [selection, setSelection] = useState<Record<number, number>>({})

  const pinnedFor = (documentId: number) =>
    pinnedDocuments.find((item) => item.documentId === documentId)

  if (documents.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-violet-700">
          02 · Documentos
        </p>
        <div className="mt-4">
          <EmptyState
            title="No hay documentos disponibles"
            description="El expediente necesita documentos activos antes de preparar el paquete operativo."
          />
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wide text-violet-700">
          02 · Documentos
        </p>
        <h2 className="mt-1 text-sm font-semibold text-slate-950">
          Versiones fijadas para fabricación
        </h2>
        <p className="mt-1 text-[10px] text-slate-500">
          Cada vínculo conserva una versión exacta; cambiar la versión es un
          evento auditable.
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {getErrorMessage(error)}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3">
        {documents.map(({ document, versions }) => {
          const pinned = pinnedFor(document.id)
          const availableVersions =
            versions.length > 0 ? versions : [document.currentVersion]
          const selectedVersionId =
            selection[document.id] ??
            pinned?.documentVersionId ??
            document.currentVersion.id

          return (
            <article
              key={document.id}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-600">
                    {document.documentType}
                  </p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-950">
                    {document.name}
                  </p>
                  <p className="mt-1 text-[9px] text-slate-500">
                    Vigente v{document.currentVersion.version}
                    {pinned
                      ? ` · Fijada v${pinned.version}`
                      : ' · Sin versión fijada'}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    aria-label={`Versión de ${document.name}`}
                    value={selectedVersionId}
                    disabled={!canEdit || saving}
                    onChange={(event) =>
                      setSelection((current) => ({
                        ...current,
                        [document.id]: Number(event.target.value),
                      }))
                    }
                    className="h-9 min-w-[190px] rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    {availableVersions.map((version) => (
                      <option key={version.id} value={version.id}>
                        v{version.version} · {version.fileName}
                      </option>
                    ))}
                  </select>

                  {canEdit ? (
                    <Button
                      size="sm"
                      variant={pinned ? 'secondary' : 'primary'}
                      disabled={
                        saving || pinned?.documentVersionId === selectedVersionId
                      }
                      onClick={() =>
                        void onPin(document.id, selectedVersionId)
                      }
                    >
                      {pinned ? 'Actualizar versión' : 'Fijar versión'}
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {!canEdit ? (
        <p className="mt-4 text-[10px] leading-5 text-slate-500">
          Las versiones quedan bloqueadas al aprobar la hoja de ruta o cuando
          la orden sale de preparación.
        </p>
      ) : null}
    </section>
  )
}
