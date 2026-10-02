import { useEffect, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { useCreateQuotation, useQuotations } from '@/modules/quotations'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { InformationRequestForm } from '../components/InformationRequestForm'
import { JobCaseActionBar } from '../components/JobCaseActionBar'
import { JobCaseClarifications } from '../components/JobCaseClarifications'
import { JobCaseDetailHeader } from '../components/JobCaseDetailHeader'
import { JobCaseDocuments } from '../components/JobCaseDocuments'
import { JobCaseFlowSteps } from '../components/JobCaseFlowSteps'
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
  'specification',
  'activity',
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
  const canReadQuotationFlow =
    session?.user.roles.includes('ADMIN') === true ||
    session?.user.roles.includes('COMMERCIAL') === true
  const quotationsQuery = useQuotations(canReadQuotationFlow)
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

  const jobCase = detailQuery.data
  const currentQuotation =
    quotationsQuery.data?.find((quotation) => quotation.caseId === validId) ??
    null
  const quotationLookupReady =
    !canReadQuotationFlow ||
    (!quotationsQuery.isPending && !quotationsQuery.isError)
  const mutationError =
    takeMutation.error ??
    infoMutation.error ??
    materialMutation.error ??
    completeMutation.error ??
    createQuotationMutation.error

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

  let content

  if (activeTab === 'summary') {
    content = (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-stretch">
        <JobCaseSummary jobCase={jobCase} />

        <JobCaseActionBar
          jobCase={jobCase}
          user={session.user}
          taking={takeMutation.isPending}
          completing={completeMutation.isPending}
          creatingQuotation={createQuotationMutation.isPending}
          quotationId={currentQuotation?.id ?? null}
          quotationLookupReady={quotationLookupReady}
          onTake={() => takeMutation.mutate()}
          onRequestInformation={() => setActionPanel('information')}
          onDefineMaterial={() => setActionPanel('material')}
          onComplete={() => completeMutation.mutate()}
          onCreateQuotation={() => void createQuotation()}
          onOpenQuotation={() => {
            if (currentQuotation) {
              navigate(`/quotations/${currentQuotation.id}`)
            }
          }}
        />
      </div>
    )
  } else if (activeTab === 'documents') {
    content = <JobCaseDocuments documents={jobCase.documents} />
  } else if (activeTab === 'specification') {
    content = (
      <JobCaseMaterial
        specification={jobCase.materialSpecification}
        request={jobCase.request}
      />
    )
  } else if (timelineQuery.isPending) {
    content = <LoadingState label="Cargando actividad…" />
  } else if (timelineQuery.isError) {
    content = (
      <ErrorState
        error={timelineQuery.error}
        title="No pudimos cargar la actividad"
      />
    )
  } else {
    content = (
      <div className="space-y-3">
        <JobCaseClarifications requests={jobCase.informationRequests} />
        <JobCaseTimeline events={timelineQuery.data} />
      </div>
    )
  }

  return (
    <PageContainer className="py-4 lg:py-3">
      <JobCaseDetailHeader jobCase={jobCase} />

      <div className="space-y-4">
        <JobCaseFlowSteps status={jobCase.status} />

        <JobCaseTabs
          activeTab={activeTab}
          documentCount={jobCase.documents.length}
          onChange={(tab) =>
            setSearchParams(tab === 'summary' ? {} : { tab })
          }
        />

        {mutationError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700"
          >
            {getErrorMessage(mutationError)}
          </div>
        ) : null}

        {canReadQuotationFlow &&
        jobCase.status === 'READY_FOR_QUOTATION' &&
        quotationsQuery.isError ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-[8px] leading-4 text-amber-800">
            No pudimos verificar si este expediente ya tiene una cotización.
            Vuelve a intentarlo antes de iniciar un flujo comercial para evitar
            duplicados.
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
            current={jobCase.materialSpecification}
            isSubmitting={materialMutation.isPending}
            onCancel={() => setActionPanel(null)}
            onSubmit={submitMaterial}
          />
        ) : null}

        {content}
      </div>
    </PageContainer>
  )
}
