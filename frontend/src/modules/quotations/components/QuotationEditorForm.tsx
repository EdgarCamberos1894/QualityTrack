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
      className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px]"
      onSubmit={(event) => event.preventDefault()}
    >
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
        <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Documento comercial
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Información de la revisión
            </h2>
          </div>

          <Button
            size="sm"
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={() => void preview()}
            disabled={saving || sending}
          >
            Vista previa
          </Button>
        </div>

        <div className="p-3.5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <TextField
              label="Moneda"
              maxLength={3}
              disabled={!editable}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !uppercase !shadow-none"
              error={errors.currency?.message}
              {...register('currency')}
            />
            <TextField
              label="Impuesto (%)"
              type="number"
              min="0"
              max="100"
              step="0.0001"
              disabled={!editable}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.taxRate?.message}
              {...register('taxRate', { valueAsNumber: true })}
            />
            <TextField
              label="Válida hasta"
              type="date"
              disabled={!editable}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.validUntil?.message}
              {...register('validUntil')}
            />
            <TextField
              label="Entrega estimada"
              type="date"
              disabled={!editable}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.estimatedDeliveryDate?.message}
              {...register('estimatedDeliveryDate')}
            />
          </div>

          {quotation.adjustmentNotes ? (
            <div className="mt-3">
              <TextareaField
                label="Respuesta al ajuste"
                disabled={!editable}
                labelClassName="!mb-1.5 !text-[10px]"
                className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
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

          <div className="mt-3">
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
              className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700"
            >
              {actionError}
            </p>
          ) : null}
        </div>

        {editable ? (
          <div className="flex flex-wrap justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-3.5 py-2.5">
            <Button
              size="sm"
              variant="secondary"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={() => void save()}
              disabled={saving || sending}
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>

            <Button
              size="sm"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={() => void send()}
              disabled={saving || sending}
            >
              {sending
                ? 'Enviando…'
                : quotation.adjustmentNotes
                  ? 'Enviar nueva revisión'
                  : 'Enviar al cliente'}
            </Button>
          </div>
        ) : null}
      </section>

      <QuotationTotalsCard
        totals={totals}
        currency={currency}
        taxRate={taxRate}
      />
    </form>
  )
}
