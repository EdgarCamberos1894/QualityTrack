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
    <section className="flex h-full min-h-[150px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50/45">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-3.5 py-2.5">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Partidas
          </p>
          <h3 className="mt-0.5 text-[11px] font-semibold text-slate-950">
            Conceptos de la cotización
          </h3>
        </div>

        {editable ? (
          <Button
            size="sm"
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
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

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-2.5 pr-2 lg:max-h-[280px]">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-4 text-center text-[9px] text-slate-400">
            Todavía no hay conceptos en esta revisión.
          </div>
        ) : null}

        {fields.map((field, index) => {
          const item = items[index]
          const subtotal = lineTotal(item?.quantity ?? 0, item?.unitPrice ?? 0)

          return (
            <div
              key={field.id}
              className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2.5 lg:grid-cols-[minmax(240px,1fr)_90px_120px_130px_auto]"
            >
              <div>
                <label className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                  Descripción
                </label>
                <input
                  disabled={!editable}
                  {...register(`items.${index}.description`)}
                  className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-2.5 text-[10px] text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
                />
                {errors.items?.[index]?.description?.message ? (
                  <p className="mt-1 text-[8px] text-red-600">
                    {errors.items[index]?.description?.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
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
                  className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-2.5 text-[10px] text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
                />
                {errors.items?.[index]?.quantity?.message ? (
                  <p className="mt-1 text-[8px] text-red-600">
                    {errors.items[index]?.quantity?.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
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
                  className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-2.5 text-[10px] text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
                />
                {errors.items?.[index]?.unitPrice?.message ? (
                  <p className="mt-1 text-[8px] text-red-600">
                    {errors.items[index]?.unitPrice?.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col justify-center lg:pt-3">
                <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                  Importe
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-900">
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
                    className="!h-7 !px-2 !text-[8px] text-slate-500"
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
