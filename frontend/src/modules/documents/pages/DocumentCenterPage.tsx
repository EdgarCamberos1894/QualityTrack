import { useMemo, useState } from 'react'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { DocumentCenterFilters } from '../components/DocumentCenterFilters'
import { DocumentCenterTable } from '../components/DocumentCenterTable'
import { useDocumentCenter } from '../hooks/useDocumentCenter'
import {
  documentMatchesSearch,
  type DocumentContextFilter,
} from '../model/documentCenterPresenter'

export function DocumentCenterPage() {
  const query = useDocumentCenter()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('ALL')
  const [context, setContext] = useState<DocumentContextFilter>('ALL')
  const [customerId, setCustomerId] = useState('ALL')

  const documentTypes = useMemo(
    () =>
      [
        ...new Set(query.data?.map((document) => document.documentType) ?? []),
      ].sort((left, right) => left.localeCompare(right)),
    [query.data],
  )

  const customers = useMemo(() => {
    const byId = new Map<number, string>()

    for (const document of query.data ?? []) {
      byId.set(document.customerId, document.customerName)
    }

    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((left, right) => left.name.localeCompare(right.name))
  }, [query.data])

  const documents = useMemo(
    () =>
      (query.data ?? []).filter((document) => {
        if (!documentMatchesSearch(document, search)) return false
        if (type !== 'ALL' && document.documentType !== type) return false
        if (context !== 'ALL' && !document.contexts.includes(context)) {
          return false
        }
        if (
          customerId !== 'ALL' &&
          document.customerId !== Number(customerId)
        ) {
          return false
        }
        return true
      }),
    [context, customerId, query.data, search, type],
  )

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Centro documental</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Consulta transversal. La fuente sigue siendo el expediente y sus
          versiones; aquí no se duplican archivos.
        </p>
      </div>

      {query.isPending ? (
        <LoadingState label="Cargando centro documental…" />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          title="No pudimos cargar el centro documental"
        />
      ) : (
        <div className="space-y-5">
          <DocumentCenterFilters
            search={search}
            type={type}
            context={context}
            customerId={customerId}
            documentTypes={documentTypes}
            customers={customers}
            onSearchChange={setSearch}
            onTypeChange={setType}
            onContextChange={setContext}
            onCustomerChange={setCustomerId}
          />

          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] text-slate-500">
              {documents.length} documento{documents.length === 1 ? '' : 's'}
            </p>
            <p className="text-[10px] text-slate-400">
              Solo se muestra la versión vigente de cada documento.
            </p>
          </div>

          <DocumentCenterTable documents={documents} />
        </div>
      )}
    </PageContainer>
  )
}
