import { useEffect, useMemo, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  routingOperationSchema,
  type RoutingOperationFormValues,
} from '../schemas/workOrderPreparation.schemas'
import type { RoutingOperationDto } from '../types/workOrder.types'

interface RoutingOperationDialogProps {
  open: boolean
  operation?: RoutingOperationDto
  operations: RoutingOperationDto[]
  nextSequence: number
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: RoutingOperationFormValues) => Promise<boolean>
}

function suggestOperationCode(sequenceNumber: number) {
  if (!Number.isInteger(sequenceNumber) || sequenceNumber <= 0) return ''
  return `OP-${sequenceNumber * 10}`
}

function previousOperations(
  operations: RoutingOperationDto[],
  sequenceNumber: number,
  operationId?: number,
) {
  return operations
    .filter((item) => item.id !== operationId)
    .filter((item) => item.sequenceNumber < sequenceNumber)
    .sort((left, right) => left.sequenceNumber - right.sequenceNumber)
}

function defaultPrerequisites(
  operations: RoutingOperationDto[],
  sequenceNumber: number,
  operationId?: number,
) {
  const previous = previousOperations(operations, sequenceNumber, operationId)
  const immediate = previous.at(-1)
  return immediate ? [immediate.id] : []
}

export function RoutingOperationDialog({
  open,
  operation,
  operations,
  nextSequence,
  submitting,
  error,
  onClose,
  onSubmit,
}: RoutingOperationDialogProps) {
  const codeManuallyEditedRef = useRef(false)
  const dependenciesManuallyEditedRef = useRef(false)
  const initialSequence = operation?.sequenceNumber ?? nextSequence
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoutingOperationFormValues>({
    resolver: zodResolver(routingOperationSchema),
    defaultValues: {
      sequenceNumber: initialSequence,
      code: operation?.code ?? suggestOperationCode(initialSequence),
      name: operation?.name ?? '',
      instructions: operation?.instructions ?? '',
      estimatedMinutes: operation?.estimatedMinutes ?? 30,
      prerequisiteOperationIds:
        operation?.prerequisiteOperationIds ??
        defaultPrerequisites(operations, initialSequence),
    },
  })

  const sequenceNumber = watch('sequenceNumber')
  const selectedPrerequisiteIds = watch('prerequisiteOperationIds') ?? []
  const availablePrerequisites = useMemo(
    () => previousOperations(operations, sequenceNumber, operation?.id),
    [operation?.id, operations, sequenceNumber],
  )

  useEffect(() => {
    const nextOperationSequence = operation?.sequenceNumber ?? nextSequence
    const suggestedCode = suggestOperationCode(nextOperationSequence)
    const existingCode = operation?.code ?? suggestedCode

    codeManuallyEditedRef.current = Boolean(
      operation && existingCode !== suggestedCode,
    )
    dependenciesManuallyEditedRef.current = Boolean(operation)

    reset({
      sequenceNumber: nextOperationSequence,
      code: existingCode,
      name: operation?.name ?? '',
      instructions: operation?.instructions ?? '',
      estimatedMinutes: operation?.estimatedMinutes ?? 30,
      prerequisiteOperationIds:
        operation?.prerequisiteOperationIds ??
        defaultPrerequisites(operations, nextOperationSequence),
    })
  }, [nextSequence, operation, operations, reset])

  if (!open) return null

  const sequenceField = register('sequenceNumber', { valueAsNumber: true })
  const codeField = register('code')

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      reset()
    }
  })

  const changeSequence = (value: number) => {
    if (!codeManuallyEditedRef.current) {
      setValue('code', suggestOperationCode(value), {
        shouldDirty: true,
        shouldValidate: true,
      })
    }

    const availableIds = new Set(
      previousOperations(operations, value, operation?.id).map((item) => item.id),
    )

    if (!dependenciesManuallyEditedRef.current) {
      setValue(
        'prerequisiteOperationIds',
        defaultPrerequisites(operations, value, operation?.id),
        { shouldDirty: true, shouldValidate: true },
      )
      return
    }

    setValue(
      'prerequisiteOperationIds',
      selectedPrerequisiteIds.filter((id) => availableIds.has(id)),
      { shouldDirty: true, shouldValidate: true },
    )
  }

  const togglePrerequisite = (operationId: number) => {
    dependenciesManuallyEditedRef.current = true
    const selected = new Set(selectedPrerequisiteIds)
    if (selected.has(operationId)) selected.delete(operationId)
    else selected.add(operationId)
    setValue('prerequisiteOperationIds', [...selected], {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="routing-operation-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="sticky top-0 z-10 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Hoja de ruta
          </p>
          <h2
            id="routing-operation-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            {operation ? 'Editar operación' : 'Agregar operación'}
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Define la operación y qué pasos deben terminar antes de que pueda iniciar.
          </p>
        </div>

        <div className="grid gap-3 px-4 py-3.5 sm:grid-cols-2">
          <TextField
            label="Secuencia"
            type="number"
            min="1"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.sequenceNumber?.message}
            {...sequenceField}
            onChange={(event) => {
              void sequenceField.onChange(event)
              changeSequence(event.currentTarget.valueAsNumber)
            }}
          />
          <div>
            <TextField
              label="Código"
              maxLength={40}
              placeholder="OP-10"
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.code?.message}
              {...codeField}
              onChange={(event) => {
                codeManuallyEditedRef.current = true
                void codeField.onChange(event)
              }}
            />
            <p className="mt-1 text-[7px] leading-3 text-slate-400">
              Se sugiere según la secuencia, pero puedes editarlo.
            </p>
          </div>
          <div className="sm:col-span-2">
            <TextField
              label="Nombre"
              maxLength={150}
              placeholder="Torneado exterior"
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <TextField
            label="Tiempo estimado (min)"
            type="number"
            min="1"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.estimatedMinutes?.message}
            {...register('estimatedMinutes', { valueAsNumber: true })}
          />

          <div className="sm:col-span-2 rounded-xl border border-blue-100 bg-blue-50/35 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-900">
                  Debe esperar a
                </p>
                <p className="mt-0.5 text-[7px] leading-3.5 text-slate-500">
                  Solo aparecen secuencias anteriores. Puedes elegir varias para unir ramas del proceso.
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[7.5px] font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                onClick={() => {
                  dependenciesManuallyEditedRef.current = true
                  setValue('prerequisiteOperationIds', [], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }}
              >
                Puede iniciar libre
              </button>
            </div>

            {availablePrerequisites.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-blue-200 bg-white/70 px-3 py-2 text-[8px] text-slate-500">
                Esta es una operación raíz: podrá iniciar al liberar Producción.
              </div>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {availablePrerequisites.map((candidate) => {
                  const selected = selectedPrerequisiteIds.includes(candidate.id)
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => togglePrerequisite(candidate.id)}
                      className={
                        selected
                          ? 'flex items-start gap-2.5 rounded-lg border border-blue-300 bg-white px-3 py-2 text-left ring-2 ring-blue-100'
                          : 'flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-left transition hover:border-blue-200'
                      }
                    >
                      <span
                        className={
                          selected
                            ? 'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-blue-600 text-[8px] font-bold text-white'
                            : 'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-transparent'
                        }
                      >
                        ✓
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[8px] font-bold text-blue-700">
                          {candidate.sequenceNumber} · {candidate.code}
                        </span>
                        <span className="mt-0.5 block truncate text-[8px] font-medium text-slate-700">
                          {candidate.name}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/75 px-3 py-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[8px] font-bold text-blue-700">
                {sequenceNumber || '•'}
              </span>
              <span className="h-px flex-1 bg-blue-200" />
              <p className="text-[7.5px] text-slate-500">
                {selectedPrerequisiteIds.length === 0
                  ? 'Inicio independiente, sin dependencias previas.'
                  : `Se habilitará cuando ${selectedPrerequisiteIds.length === 1 ? 'termine la operación seleccionada' : `terminen las ${selectedPrerequisiteIds.length} operaciones seleccionadas`}.`}
              </p>
            </div>
          </div>

          <div className="sm:col-span-2">
            <TextareaField
              label="Instrucciones"
              placeholder="Indicaciones técnicas para ejecutar la operación…"
              labelClassName="!mb-1.5 !text-[10px]"
              className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
              error={errors.instructions?.message}
              {...register('instructions')}
            />
          </div>

          {error ? (
            <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/95 px-4 py-2.5 backdrop-blur">
          <Button
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="!h-7 !px-2.5 !text-[8px]"
            disabled={submitting}
          >
            {submitting
              ? 'Guardando…'
              : operation
                ? 'Guardar cambios'
                : 'Agregar operación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
