import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { CustomerRequestDetailsStep } from '../components/CustomerRequestDetailsStep'
import { CustomerRequestRequirementsStep } from '../components/CustomerRequestRequirementsStep'
import { CustomerRequestReviewStep } from '../components/CustomerRequestReviewStep'
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
      <div className="mb-6">
        <p className="text-[10px] text-slate-500">
          Solicitudes / Nueva solicitud
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Nueva solicitud
        </h1>
        <p className="mt-2 text-xs text-slate-500">
          Cuéntanos qué necesitas. No hace falta resolver la ingeniería antes de
          enviarlo.
        </p>
      </div>

      <CustomerRequestWizardSteps currentStep={step} />

      <form onSubmit={(event) => void submit(event)}>
        {step === 0 ? (
          <CustomerRequestDetailsStep register={register} errors={errors} />
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
          />
        ) : null}

        {step === 2 ? (
          <CustomerRequestReviewStep
            values={getValues()}
            documents={documents}
          />
        ) : null}

        {mutation.error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {getErrorMessage(mutation.error)}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-between">
          {step === 0 ? (
            <Link
              to={`/portal/${customer.customerId}/requests`}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </Link>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setStep((current) => current - 1)}
              disabled={mutation.isPending}
            >
              Atrás
            </Button>
          )}

          {step === 0 ? (
            <Button onClick={() => void goToRequirements()}>Continuar</Button>
          ) : step === 1 ? (
            <Button onClick={() => void goToReview()}>Revisar</Button>
          ) : (
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enviando…' : 'Enviar solicitud'}
            </Button>
          )}
        </div>
      </form>
    </PageContainer>
  )
}
