import { useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { DocumentCenterFilters } from '../components/DocumentCenterFilters'
import { DocumentCenterRow } from '../components/DocumentCenterRow'
import { DocumentHistoryDialog } from '../components/DocumentHistoryDialog'
import { useDocumentCenter } from '../hooks/useDocumentCenter'
import { useDocumentFileActions } from '../hooks/useDocumentFileActions'
import { documentMatchesSearch } from '../model/documentCenterPresenter'
import type {
  DocumentCenterDto,
  DocumentContextDto,
} from '../types/documentCenter.types'

export function DocumentCenterPage() {
  const query = useDocumentCenter()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('ALL')
  const [context, setContext] = useState<DocumentContextDto | 'ALL'>('ALL')
  const [customerId, setCustomerId] = useState<number | 'ALL'>('ALL')
  const [historyDocument, setHistoryDocument] =
    useState<DocumentCenterDto | null>(null)
  const {
    busyVersionId,
    error: fileError,
    openVersion,
    downloadVersion,
  } = useDocumentFileActions()

  const visibleDocuments = useMemo(() => {
    if (!query.data) return []

    return query.data.filter((document) => {
      if (!documentMatchesSearch(document, search)) return false
      if (type !== 'ALL' && document.documentType !== type) return false
      if (context !== 'ALL' && !document.contexts.includes(context)) {
        return false
      }
      if (customerId !== 'ALL' && document.customerId !== customerId) {
        return false
      }
      return true
    })
  }, [context, customerId, query.data, search, type])

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operación"
        title="Centro documental"
        description="Consulta transversal de documentos de expediente y recursos operativos, conservando su origen y el historial de versiones."
      />

      {query.isPending ? (
        <LoadingState label="Cargando centro documental…" />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          title="No pudimos cargar el centro documental"
        />
      ) : (
        <>
          <DocumentCenterFilters
            documents={query.data}
            search={search}
            type={type}
            context={context}
            customerId={customerId}
            onSearchChange={setSearch}
            onTypeChange={setType}
            onContextChange={setContext}
            onCustomerChange={setCustomerId}
          />

          {fileError ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {getErrorMessage(fileError)}
            </p>
          ) : null}

          <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="hidden border-b border-slate-200 bg-slate-50 px-4 py-3 text-[9px] font-semibold uppercase tracking-wide text-slate-500 lg:grid lg:grid-cols-[minmax(220px,1.4fr)_190px_minmax(170px,1fr)_90px_170px_150px]">
              <span>Documento</span>
              <span>Tipo</span>
              <span>Contexto</span>
              <span>Versión</span>
              <span>Actualizado</span>
              <span className="text-right">Acciones</span>
            </div>

            {visibleDocuments.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="No hay documentos para mostrar"
                  description="Prueba otra búsqueda o cambia los filtros."
                />
              </div>
            ) : (
              visibleDocuments.map((document) => (
                <DocumentCenterRow
                  key={document.id}
                  document={document}
                  busy={busyVersionId === document.currentVersion.id}
                  onOpen={() =>
                    void openVersion(document, document.currentVersion.id)
                  }
                  onHistory={() => setHistoryDocument(document)}
                />
              ))
            )}
          </section>

          <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[10px] leading-5 text-slate-600">
            Regla documental: una nueva versión no reemplaza el historial. Las
            referencias operativas conservan la versión que utilizaron.
          </p>
        </>
      )}

      <DocumentHistoryDialog
        document={historyDocument}
        busyVersionId={busyVersionId}
        onClose={() => setHistoryDocument(null)}
        onOpenVersion={(versionId) => {
          if (historyDocument) {
            void openVersion(historyDocument, versionId)
          }
        }}
        onDownloadVersion={(versionId, fileName) => {
          if (historyDocument) {
            void downloadVersion(historyDocument, versionId, fileName)
          }
        }}
      />
    </PageContainer>
  )
}
