import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { QuotationItemsEditor } from './QuotationItemsEditor'
import { QuotationTotalsCard } from './QuotationTotalsCard'
import {
  calculateQuotationTotals,
  createQuotationFormValues,
  getSendValidationMessage,
  quotationDraftSchema,
  toUpdateQuotationPayload,
  type QuotationFormValues,
  type QuotationPreviewData,
} from '../schemas/quotation.schema'
import type {
  QuotationDetailDto,
  UpdateQuotationPayload,
} from '../types/quotation.types'

interface QuotationEditorFormProps {
  quotation: QuotationDetailDto
  editable: boolean
  saving: boolean
  sending: boolean
  onSave: (payload: UpdateQuotationPayload) => Promise<void>
  onSend: (
    payload: UpdateQuotationPayload,
    adjustmentResponse: string | null,
  ) => Promise<void>
  onPreview: (preview: QuotationPreviewData) => void
}

export function QuotationEditorForm({
  quotation,
  editable,
  saving,
  sending,
  onSave,
  onSend,
  onPreview,
}: QuotationEditorFormProps) {
  const [actionError, setActionError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationDraftSchema),
    defaultValues: createQuotationFormValues(quotation),
  })

  useEffect(() => {
    reset(createQuotationFormValues(quotation))
  }, [quotation, reset])

  const items = useWatch({ control, name: 'items' })
  const taxRate = useWatch({ control, name: 'taxRate' })
  const currency = useWatch({ control, name: 'currency' })
  const totals = calculateQuotationTotals({ items, taxRate })
  const requiresAdjustmentResponse = Boolean(quotation.adjustmentNotes)

  const save = handleSubmit(async (values) => {
    setActionError(null)
    await onSave(toUpdateQuotationPayload(values))
  })

  const send = handleSubmit(async (values) => {
    const message = getSendValidationMessage(values, requiresAdjustmentResponse)

    if (message) {
      setActionError(message)
      return
    }

    setActionError(null)
    await onSend(
      toUpdateQuotationPayload(values),
      values.adjustmentResponse.trim() || null,
    )
  })

  const preview = handleSubmit((values) => {
    setActionError(null)
    onPreview({
      ...values,
      totals: calculateQuotationTotals(values),
    })
  })

  return (
    <form
      className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]"
      onSubmit={(event) => event.preventDefault()}
    >
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-[15px] font-semibold text-slate-950">
          Información comercial
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <TextField
            label="Moneda"
            maxLength={3}
            disabled={!editable}
            className="uppercase"
            error={errors.currency?.message}
            {...register('currency')}
          />
          <TextField
            label="Válida hasta"
            type="date"
            disabled={!editable}
            error={errors.validUntil?.message}
            {...register('validUntil')}
          />
          <TextField
            label="Entrega estimada"
            type="date"
            disabled={!editable}
            error={errors.estimatedDeliveryDate?.message}
            {...register('estimatedDeliveryDate')}
          />
        </div>

        <div className="mt-4 max-w-[220px]">
          <TextField
            label="Impuesto (%)"
            type="number"
            min="0"
            max="100"
            step="0.0001"
            disabled={!editable}
            error={errors.taxRate?.message}
            {...register('taxRate', { valueAsNumber: true })}
          />
        </div>

        {quotation.adjustmentNotes ? (
          <div className="mt-4">
            <TextareaField
              label="Respuesta al ajuste"
              disabled={!editable}
              hint={
                editable
                  ? 'Obligatoria para enviar esta nueva revisión.'
                  : undefined
              }
              error={errors.adjustmentResponse?.message}
              {...register('adjustmentResponse')}
            />
          </div>
        ) : null}

        <div className="mt-5">
          <QuotationItemsEditor
            control={control}
            register={register}
            errors={errors}
            editable={editable}
            currency={currency}
          />
        </div>

        {actionError ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {actionError}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {editable ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void save()}
              disabled={saving || sending}
            >
              {saving ? 'Guardando…' : 'Guardar borrador'}
            </Button>
          ) : null}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => void preview()}
            disabled={saving || sending}
          >
            Vista previa
          </Button>

          {editable ? (
            <Button
              size="sm"
              onClick={() => void send()}
              disabled={saving || sending}
            >
              {sending
                ? 'Enviando…'
                : quotation.adjustmentNotes
                  ? 'Enviar nueva revisión'
                  : 'Enviar al cliente'}
            </Button>
          ) : null}
        </div>
      </section>

      <QuotationTotalsCard
        totals={totals}
        currency={currency}
        taxRate={taxRate}
      />
    </form>
  )
}
