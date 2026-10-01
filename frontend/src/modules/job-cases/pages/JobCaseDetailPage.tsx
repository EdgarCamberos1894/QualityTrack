import { useEffect, useMemo, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { useCreateQuotation } from '@/modules/quotations'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { InformationRequestForm } from '../components/InformationRequestForm'
import { JobCaseActionBar } from '../components/JobCaseActionBar'
import { JobCaseClarifications } from '../components/JobCaseClarifications'
import { JobCaseDetailHeader } from '../components/JobCaseDetailHeader'
import { JobCaseDocuments } from '../components/JobCaseDocuments'
import { JobCaseMaterial } from '../components/JobCaseMaterial'
import { JobCaseSummary } from '../components/JobCaseSummary'
import { JobCaseTabs } from '../components/JobCaseTabs'
import { JobCaseTimeline } from '../components/JobCaseTimeline'
import { MaterialSpecificationForm } from '../components/MaterialSpecificationForm'
import { useJobCaseDetail } from '../hooks/useJobCaseDetail'
import {
  useCompleteJobCaseReview,
  useDefineJobCaseMaterial,
  useRequestJobCaseInformation,
  useTakeJobCase,
} from '../hooks/useJobCaseMutations'
import { useJobCaseTimeline } from '../hooks/useJobCaseTimeline'
import type { JobCaseDetailTab } from '../types/jobCase.types'

type ActionPanel = 'information' | 'material' | null

const validTabs: JobCaseDetailTab[] = [
  'summary',
  'documents',
  'clarifications',
  'material',
  'traceability',
]

function resolveTab(value: string | null): JobCaseDetailTab {
  return validTabs.includes(value as JobCaseDetailTab)
    ? (value as JobCaseDetailTab)
    : 'summary'
}

export function JobCaseDetailPage() {
  const { caseId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [actionPanel, setActionPanel] = useState<ActionPanel>(null)
  const session = useSessionStore((state) => state.session)
  const numericId = Number(caseId)
  const validId =
    Number.isInteger(numericId) && numericId > 0 ? numericId : null
  const detailQuery = useJobCaseDetail(validId)
  const timelineQuery = useJobCaseTimeline(validId)
  const takeMutation = useTakeJobCase(validId ?? 0)
  const infoMutation = useRequestJobCaseInformation(validId ?? 0)
  const materialMutation = useDefineJobCaseMaterial(validId ?? 0)
  const completeMutation = useCompleteJobCaseReview(validId ?? 0)
  const createQuotationMutation = useCreateQuotation()
  const activeTab = resolveTab(searchParams.get('tab'))

  useEffect(() => {
    if (!detailQuery.data || !location.hash) return

    const frame = window.requestAnimationFrame(() => {
      const targetId = decodeURIComponent(location.hash.slice(1))
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeTab, detailQuery.data, location.hash])

  const mutationError =
    takeMutation.error ??
    infoMutation.error ??
    materialMutation.error ??
    completeMutation.error ??
    createQuotationMutation.error

  const content = useMemo(() => {
    if (!detailQuery.data) return null

    if (activeTab === 'documents') {
      return <JobCaseDocuments documents={detailQuery.data.documents} />
    }

    if (activeTab === 'clarifications') {
      return (
        <JobCaseClarifications
          requests={detailQuery.data.informationRequests}
        />
      )
    }

    if (activeTab === 'material') {
      return (
        <JobCaseMaterial
          specification={detailQuery.data.materialSpecification}
        />
      )
    }

    if (activeTab === 'traceability') {
      if (timelineQuery.isPending) {
        return <LoadingState label="Cargando trazabilidad…" />
      }

      if (timelineQuery.isError) {
        return (
          <ErrorState
            error={timelineQuery.error}
            title="No pudimos cargar la trazabilidad"
          />
        )
      }

      return <JobCaseTimeline events={timelineQuery.data} />
    }

    return <JobCaseSummary jobCase={detailQuery.data} />
  }, [
    activeTab,
    detailQuery.data,
    timelineQuery.data,
    timelineQuery.error,
    timelineQuery.isError,
    timelineQuery.isPending,
  ])

  if (validId === null || !session) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={new Error('No fue posible abrir este expediente.')}
          title="Expediente no disponible"
        />
      </PageContainer>
    )
  }

  if (detailQuery.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando expediente…" />
      </PageContainer>
    )
  }

  if (detailQuery.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={detailQuery.error}
          title="No pudimos cargar el expediente"
        />
      </PageContainer>
    )
  }

  const submitInformation = async (values: { question: string }) => {
    await infoMutation.mutateAsync(values)
    setActionPanel(null)
  }

  const submitMaterial = async (values: {
    materialName: string
    standardOrGrade: string
    technicalNotes: string
  }) => {
    await materialMutation.mutateAsync(values)
    setActionPanel(null)
  }

  const createQuotation = async () => {
    const quotation = await createQuotationMutation.mutateAsync(validId)
    navigate(`/quotations/${quotation.id}`)
  }

  const timelineCount = timelineQuery.data?.length ?? 0

  return (
    <PageContainer className="py-4 lg:py-3">
      <JobCaseDetailHeader jobCase={detailQuery.data} />

      <div className="space-y-3">
        <JobCaseActionBar
          jobCase={detailQuery.data}
          user={session.user}
          taking={takeMutation.isPending}
          completing={completeMutation.isPending}
          creatingQuotation={createQuotationMutation.isPending}
          onTake={() => takeMutation.mutate()}
          onRequestInformation={() => setActionPanel('information')}
          onDefineMaterial={() => setActionPanel('material')}
          onComplete={() => completeMutation.mutate()}
          onCreateQuotation={() => void createQuotation()}
        />

        {mutationError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700"
          >
            {getErrorMessage(mutationError)}
          </div>
        ) : null}

        {actionPanel === 'information' ? (
          <InformationRequestForm
            isSubmitting={infoMutation.isPending}
            onCancel={() => setActionPanel(null)}
            onSubmit={submitInformation}
          />
        ) : null}

        {actionPanel === 'material' ? (
          <MaterialSpecificationForm
            current={detailQuery.data.materialSpecification}
            isSubmitting={materialMutation.isPending}
            onCancel={() => setActionPanel(null)}
            onSubmit={submitMaterial}
          />
        ) : null}

        <JobCaseTabs
          activeTab={activeTab}
          counts={{
            documents: detailQuery.data.documents.length,
            clarifications: detailQuery.data.informationRequests.length,
            timeline: timelineCount,
          }}
          onChange={(tab) => setSearchParams(tab === 'summary' ? {} : { tab })}
        />

        {content}
      </div>
    </PageContainer>
  )
}
