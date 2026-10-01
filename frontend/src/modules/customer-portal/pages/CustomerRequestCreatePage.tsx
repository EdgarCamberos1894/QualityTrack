import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { CustomerRequestDetailsStep } from '../components/CustomerRequestDetailsStep'
import { CustomerRequestRequirementsStep } from '../components/CustomerRequestRequirementsStep'
import { CustomerRequestReviewStep } from '../components/CustomerRequestReviewStep'
import { CustomerRequestStepActions } from '../components/CustomerRequestStepActions'
import { CustomerRequestWizardSteps } from '../components/CustomerRequestWizardSteps'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import { useSubmitCustomerRequest } from '../hooks/useCustomerRequestMutations'
import {
  customerRequestFormSchema,
  type CustomerRequestFormValues,
} from '../schemas/customerRequest.schemas'
import type { RequestDocumentUpload } from '../types/customerRequest.types'

export function CustomerRequestCreatePage() {
  const { customer } = useCustomerPortalContext()
  const navigate = useNavigate()
  const mutation = useSubmitCustomerRequest(customer.customerId)
  const [step, setStep] = useState(0)
  const [documents, setDocuments] = useState<RequestDocumentUpload[]>([])
  const [documentError, setDocumentError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    trigger,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CustomerRequestFormValues>({
    resolver: zodResolver(customerRequestFormSchema),
    defaultValues: {
      title: '',
      description: '',
      quantity: 1,
      requestedDeliveryDate: '',
      customerReference: '',
      materialRequirementType: 'SPECIFIED',
      materialRequirement: '',
    },
  })

  const materialRequirementType = useWatch({
    control,
    name: 'materialRequirementType',
  })
  const canCreate = customer.role !== 'VIEWER'

  if (!canCreate) {
    return (
      <PageContainer className="py-5 lg:py-4">
        <ErrorState
          error={
            new Error('Tu rol dentro de la empresa es únicamente de consulta.')
          }
          title="No puedes crear solicitudes"
        />
      </PageContainer>
    )
  }

  const goToRequirements = async () => {
    const valid = await trigger([
      'title',
      'description',
      'quantity',
      'requestedDeliveryDate',
      'customerReference',
    ])

    if (valid) setStep(1)
  }

  const goToReview = async () => {
    const valid = await trigger([
      'materialRequirementType',
      'materialRequirement',
    ])

    if (valid) setStep(2)
  }

  const addFiles = (files: FileList | null) => {
    if (!files) return

    const nextFiles = Array.from(files)

    if (documents.length + nextFiles.length > 5) {
      setDocumentError('Puedes adjuntar hasta 5 archivos por solicitud.')
      return
    }

    const oversized = nextFiles.find((file) => file.size > 25 * 1024 * 1024)

    if (oversized) {
      setDocumentError(
        `${oversized.name} supera el límite de 25 MB por archivo.`,
      )
      return
    }

    setDocuments((current) => [
      ...current,
      ...nextFiles.map((file) => ({
        file,
        documentType: 'REQUEST_ATTACHMENT',
        name: file.name,
      })),
    ])
    setDocumentError(null)
  }

  const submit = handleSubmit(async (formValues) => {
    try {
      const request = await mutation.mutateAsync({
        ...formValues,
        customerReference: formValues.customerReference.trim() || undefined,
        requestedDeliveryDate:
          formValues.requestedDeliveryDate.trim() || undefined,
        documents,
      })

      navigate(`/portal/${customer.customerId}/requests/${request.id}`, {
        replace: true,
      })
    } catch {
      // The normalized API error is shown below.
    }
  })

  return (
    <PageContainer className="py-4 lg:py-3">
      <div className="lg:flex lg:h-[calc(100dvh-100px)] lg:min-h-0 lg:flex-col lg:overflow-hidden">
        <div className="mb-3 flex shrink-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
            <SidebarNavIcon name="requests" className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
              Gestión de trabajos
            </p>
            <div className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-950 lg:text-[22px]">
                {step === 2 ? 'Revisar y enviar' : 'Nueva solicitud'}
              </h1>
              <p className="truncate text-[10px] text-slate-500">
                {step === 2
                  ? 'Confirma la información antes de enviarla.'
                  : 'Completa la información necesaria para iniciar el trabajo.'}
              </p>
            </div>
          </div>
        </div>

        <CustomerRequestWizardSteps currentStep={step} />

        <form
          onSubmit={(event) => void submit(event)}
          className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden"
        >
          <div className="lg:min-h-0 lg:flex-1 lg:overflow-hidden">
            {step === 0 ? (
              <CustomerRequestDetailsStep
                register={register}
                errors={errors}
                actions={
                  <CustomerRequestStepActions
                    step={step}
                    customerId={customer.customerId}
                    pending={mutation.isPending}
                    onBack={() => setStep((current) => current - 1)}
                    onContinue={() => void goToRequirements()}
                    onReview={() => void goToReview()}
                  />
                }
              />
            ) : null}

            {step === 1 ? (
              <CustomerRequestRequirementsStep
                register={register}
                errors={errors}
                materialRequirementType={materialRequirementType}
                setValue={setValue}
                documents={documents}
                documentError={documentError}
                onAddFiles={addFiles}
                onRemoveFile={(index) =>
                  setDocuments((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                onUpdateFile={(index, patch) =>
                  setDocuments((current) =>
                    current.map((document, itemIndex) =>
                      itemIndex === index
                        ? { ...document, ...patch }
                        : document,
                    ),
                  )
                }
                actions={
                  <CustomerRequestStepActions
                    step={step}
                    customerId={customer.customerId}
                    pending={mutation.isPending}
                    onBack={() => setStep((current) => current - 1)}
                    onContinue={() => void goToRequirements()}
                    onReview={() => void goToReview()}
                  />
                }
              />
            ) : null}

            {step === 2 ? (
              <CustomerRequestReviewStep
                values={getValues()}
                documents={documents}
                onEditDetails={() => setStep(0)}
                onEditRequirements={() => setStep(1)}
                actions={
                  <CustomerRequestStepActions
                    step={step}
                    customerId={customer.customerId}
                    pending={mutation.isPending}
                    onBack={() => setStep((current) => current - 1)}
                    onContinue={() => void goToRequirements()}
                    onReview={() => void goToReview()}
                  />
                }
              />
            ) : null}
          </div>

          {mutation.error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[10px] text-red-700">
              {getErrorMessage(mutation.error)}
            </p>
          ) : null}
        </form>
      </div>
    </PageContainer>
  )
}
