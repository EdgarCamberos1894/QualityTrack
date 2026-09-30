import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'
import { Card } from '@/shared/components/ui/Card'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import type { CustomerRequestFormValues } from '../schemas/customerRequest.schemas'
import type {
  MaterialRequirementType,
  RequestDocumentUpload,
} from '../types/customerRequest.types'

interface CustomerRequestRequirementsStepProps {
  register: UseFormRegister<CustomerRequestFormValues>
  errors: FieldErrors<CustomerRequestFormValues>
  materialRequirementType: MaterialRequirementType
  setValue: UseFormSetValue<CustomerRequestFormValues>
  documents: RequestDocumentUpload[]
  documentError: string | null
  onAddFiles: (files: FileList | null) => void
  onRemoveFile: (index: number) => void
}

export function CustomerRequestRequirementsStep({
  register,
  errors,
  materialRequirementType,
  setValue,
  documents,
  documentError,
  onAddFiles,
  onRemoveFile,
}: CustomerRequestRequirementsStepProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,640px)_452px]">
      <Card className="space-y-5 p-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Requisitos técnicos
          </h2>
          <p className="mt-1 text-[10px] text-slate-500">
            Puedes especificar el material o pedir apoyo para definirlo.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              value: 'SPECIFIED' as const,
              title: 'Ya conozco el material',
              detail: 'Indica material, norma y requisitos conocidos.',
            },
            {
              value: 'ASSISTANCE_REQUIRED' as const,
              title: 'Necesito asesoría técnica',
              detail: 'Describe el uso y el equipo propondrá una opción.',
            },
          ].map((option) => {
            const selected = materialRequirementType === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue('materialRequirementType', option.value, {
                    shouldValidate: true,
                  })
                }
                className={
                  selected
                    ? 'rounded-xl border border-blue-600 bg-blue-50 p-4 text-left'
                    : 'rounded-xl border border-slate-200 bg-slate-50 p-4 text-left'
                }
              >
                <p className="text-xs font-semibold text-slate-950">
                  {option.title}
                </p>
                <p className="mt-1 text-[10px] leading-5 text-slate-500">
                  {option.detail}
                </p>
              </button>
            )
          })}
        </div>

        <TextareaField
          label={
            materialRequirementType === 'SPECIFIED'
              ? 'Material / norma / requisitos'
              : 'Contexto para la asesoría'
          }
          maxLength={2000}
          hint="Incluye tolerancias, condiciones de uso u otros requisitos que ya conozcas."
          error={errors.materialRequirement?.message}
          {...register('materialRequirement')}
        />

        <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 text-[10px] leading-5 text-slate-700">
          No necesitas elegir el proceso de fabricación. Comercial e Ingeniería
          lo determinan durante la revisión.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold text-slate-950">Documentos</h2>
        <p className="mt-1 text-[10px] leading-5 text-slate-500">
          Adjunta planos, fotografías o referencias. Máximo 5 archivos de 25 MB
          cada uno.
        </p>

        <label className="mt-4 block cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100">
          Agregar archivos
          <input
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => {
              onAddFiles(event.target.files)
              event.target.value = ''
            }}
          />
        </label>

        {documentError ? (
          <p className="mt-2 text-xs text-red-600">{documentError}</p>
        ) : null}

        <div className="mt-4 space-y-2">
          {documents.map((document, index) => (
            <div
              key={`${document.file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-slate-800">
                  {document.file.name}
                </p>
                <p className="text-[9px] text-slate-500">
                  {(document.file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="text-[10px] font-semibold text-red-600"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
