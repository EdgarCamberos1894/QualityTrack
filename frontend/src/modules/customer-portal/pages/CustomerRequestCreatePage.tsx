import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
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
      <section className="relative mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-slate-100/75 shadow-[0_12px_34px_-30px_rgba(15,23,42,0.35)]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-slate-200/50 blur-3xl" />

        <div className="relative flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/60">
              <SidebarNavIcon name="requests" className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Solicitudes / Nuevo trabajo
              </p>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-xl font-bold tracking-tight text-slate-950">
                  Nueva solicitud
                </h1>
                <p className="text-[10px] text-slate-500">
                  {customer.customerName}
                </p>
              </div>
              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-600">
                Cuéntanos qué necesitas. No hace falta resolver la ingeniería
                antes de enviarlo.
              </p>
            </div>
          </div>

          <Link
            to={`/portal/${customer.customerId}/requests`}
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            Volver a solicitudes
          </Link>
        </div>
      </section>

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
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[10px] text-red-700">
            {getErrorMessage(mutation.error)}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.28)]">
          <div>
            {step === 0 ? (
              <Link
                to={`/portal/${customer.customerId}/requests`}
                className="text-[10px] font-semibold text-slate-500 transition hover:text-slate-900"
              >
                Cancelar
              </Link>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setStep((current) => current - 1)}
                disabled={mutation.isPending}
                className="text-[10px]"
              >
                Atrás
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <p className="hidden text-[9px] text-slate-400 sm:block">
              Paso {step + 1} de 3
            </p>

            {step === 0 ? (
              <Button
                size="sm"
                onClick={() => void goToRequirements()}
                className="min-w-24 text-[10px]"
              >
                Continuar
              </Button>
            ) : step === 1 ? (
              <Button
                size="sm"
                onClick={() => void goToReview()}
                className="min-w-24 text-[10px]"
              >
                Revisar
              </Button>
            ) : (
              <Button
                size="sm"
                type="submit"
                disabled={mutation.isPending}
                className="min-w-32 text-[10px]"
              >
                {mutation.isPending ? 'Enviando…' : 'Enviar solicitud'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </PageContainer>
  )
}
