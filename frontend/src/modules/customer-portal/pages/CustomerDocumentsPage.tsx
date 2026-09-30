import { useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Card } from '@/shared/components/ui/Card'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { getCustomerDocumentContent } from '../api/customerDocuments.api'
import { CustomerDocumentRow } from '../components/CustomerDocumentRow'
import { useCustomerDocuments } from '../hooks/useCustomerDocuments'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import { matchesCustomerDocumentSearch } from '../model/customerDocumentPresenter'
import type { CustomerDocumentSource } from '../types/customerDocument.types'

type SourceFilter = 'ALL' | CustomerDocumentSource

function openBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function CustomerDocumentsPage() {
  const { customer } = useCustomerPortalContext()
  const query = useCustomerDocuments(customer.customerId)
  const [search, setSearch] = useState('')
  const [source, setSource] = useState<SourceFilter>('ALL')
  const [documentType, setDocumentType] = useState('ALL')
  const [busyDocumentId, setBusyDocumentId] = useState<number | null>(null)
  const [contentError, setContentError] = useState<unknown>(null)

  const types = useMemo(
    () =>
      Array.from(
        new Set((query.data ?? []).map((document) => document.documentType)),
      ).sort((left, right) => left.localeCompare(right)),
    [query.data],
  )

  const visibleDocuments = useMemo(
    () =>
      (query.data ?? []).filter(
        (document) =>
          matchesCustomerDocumentSearch(document, search) &&
          (source === 'ALL' || document.source === source) &&
          (documentType === 'ALL' || document.documentType === documentType),
      ),
    [documentType, query.data, search, source],
  )

  const loadContent = async (
    documentId: number,
    requestId: number,
    versionId: number,
    download: boolean,
  ): Promise<Blob | null> => {
    setBusyDocumentId(documentId)
    setContentError(null)

    try {
      return await getCustomerDocumentContent(
        customer.customerId,
        requestId,
        documentId,
        versionId,
        download,
      )
    } catch (error) {
      setContentError(error)
      return null
    } finally {
      setBusyDocumentId(null)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Portal de cliente"
        title="Documentos"
        description="Consulta transversal de los archivos visibles de tu empresa. La fuente y el historial siguen viviendo en cada solicitud."
      />

      <Card className="mb-5 p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px] lg:items-end">
          <TextField
            label="Buscar documentos"
            value={search}
            placeholder="Nombre, archivo, solicitud o tipo"
            onChange={(event) => setSearch(event.target.value)}
          />

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-800">
              Origen
            </span>
            <select
              value={source}
              onChange={(event) =>
                setSource(event.target.value as SourceFilter)
              }
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">Todos</option>
              <option value="CUSTOMER_UPLOAD">Solicitud</option>
              <option value="DELIVERY_EVIDENCE">Evidencia de entrega</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-800">
              Tipo
            </span>
            <select
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">Todos</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-3 text-[9px] text-slate-500">
          Se muestra únicamente la versión vigente de cada documento.
        </p>
      </Card>

      {contentError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {getErrorMessage(contentError)}
        </p>
      ) : null}

      {query.isPending ? (
        <LoadingState label="Cargando documentos…" />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          title="No pudimos cargar los documentos"
        />
      ) : visibleDocuments.length === 0 ? (
        <EmptyState
          title="No hay documentos para mostrar"
          description={
            search || source !== 'ALL' || documentType !== 'ALL'
              ? 'Prueba otros filtros o un término de búsqueda distinto.'
              : 'Los documentos visibles aparecerán aquí cuando existan en tus solicitudes o entregas.'
          }
        />
      ) : (
        <Card className="p-4">
          <div className="mb-3 hidden grid-cols-[minmax(0,1.35fr)_180px_minmax(180px,0.9fr)_90px_150px_auto] px-4 text-[9px] font-semibold uppercase tracking-wide text-slate-500 lg:grid">
            <span>Documento</span>
            <span>Tipo</span>
            <span>Solicitud</span>
            <span>Versión</span>
            <span>Actualizado</span>
            <span />
          </div>

          <div className="space-y-2">
            {visibleDocuments.map((document) => (
              <CustomerDocumentRow
                key={document.id}
                customerId={customer.customerId}
                document={document}
                busy={busyDocumentId === document.id}
                onOpen={() => {
                  void (async () => {
                    const blob = await loadContent(
                      document.id,
                      document.requestId,
                      document.currentVersion.id,
                      false,
                    )
                    if (blob) openBlob(blob)
                  })()
                }}
                onDownload={() => {
                  void (async () => {
                    const blob = await loadContent(
                      document.id,
                      document.requestId,
                      document.currentVersion.id,
                      true,
                    )
                    if (blob) {
                      downloadBlob(blob, document.currentVersion.fileName)
                    }
                  })()
                }}
              />
            ))}
          </div>
        </Card>
      )}
    </PageContainer>
  )
}
