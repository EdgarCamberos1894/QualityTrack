import { useFieldArray, useWatch } from 'react-hook-form'
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import type { QuotationFormValues } from '../schemas/quotation.schema'

interface QuotationItemsEditorProps {
  control: Control<QuotationFormValues>
  register: UseFormRegister<QuotationFormValues>
  errors: FieldErrors<QuotationFormValues>
  editable: boolean
  currency: string
}

function lineTotal(quantity: number, unitPrice: number): number {
  const safeQuantity = Number.isFinite(quantity) ? quantity : 0
  const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0
  return safeQuantity * safeUnitPrice
}

export function QuotationItemsEditor({
  control,
  register,
  errors,
  editable,
  currency,
}: QuotationItemsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })
  const items = useWatch({ control, name: 'items' })
  const safeCurrency =
    currency.trim().length === 3 ? currency.toUpperCase() : 'MXN'

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-950">Conceptos</h3>
          <p className="mt-1 text-[9px] text-slate-500">
            El orden de las filas define el orden final de la cotización.
          </p>
        </div>

        {editable ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              append({
                description: '',
                quantity: 1,
                unitPrice: 0,
              })
            }
          >
            Agregar concepto
          </Button>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-xs text-slate-500">
            Todavía no hay conceptos en esta revisión.
          </div>
        ) : null}

        {fields.map((field, index) => {
          const item = items[index]
          const subtotal = lineTotal(item?.quantity ?? 0, item?.unitPrice ?? 0)

          return (
            <div
              key={field.id}
              className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 @4xl/page:grid-cols-[minmax(260px,1fr)_120px_150px_140px_auto]"
            >
              <div>
                <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Descripción
                </label>
                <input
                  disabled={!editable}
                  {...register(`items.${index}.description`)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
                {errors.items?.[index]?.description?.message ? (
                  <p className="mt-1 text-[10px] text-red-600">
                    {errors.items[index]?.description?.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  disabled={!editable}
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
                {errors.items?.[index]?.quantity?.message ? (
                  <p className="mt-1 text-[10px] text-red-600">
                    {errors.items[index]?.quantity?.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Precio unitario
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={!editable}
                  {...register(`items.${index}.unitPrice`, {
                    valueAsNumber: true,
                  })}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
                {errors.items?.[index]?.unitPrice?.message ? (
                  <p className="mt-1 text-[10px] text-red-600">
                    {errors.items[index]?.unitPrice?.message}
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                  Importe
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-900">
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: safeCurrency,
                  }).format(subtotal)}
                </p>
              </div>

              {editable ? (
                <div className="flex items-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(index)}
                    aria-label={`Eliminar concepto ${index + 1}`}
                  >
                    Quitar
                  </Button>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
