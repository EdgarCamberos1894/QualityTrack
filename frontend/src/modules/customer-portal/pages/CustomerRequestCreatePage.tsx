import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
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
      <PageContainer>
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
    <PageContainer>
      <div className="lg:flex lg:min-h-[calc(100vh-140px)] lg:flex-col">
        <div className="mb-4 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            {step === 2 ? 'Revisar y enviar' : 'Nueva solicitud'}
          </h1>
          <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
            {step === 2
              ? 'Confirma que la información representa lo que necesitas. El equipo validará la viabilidad después.'
              : 'Agrega lo que ya sabes y adjunta la documentación que ayudará a revisar el trabajo.'}
          </p>
        </div>

        <CustomerRequestWizardSteps currentStep={step} />

        <form
          onSubmit={(event) => void submit(event)}
          className="lg:flex lg:flex-1 lg:flex-col"
        >
          <div>
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
