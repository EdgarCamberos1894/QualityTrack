import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
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
    <div className="grid gap-4 xl:grid-cols-[minmax(0,640px)_452px]">
      <Card className="relative overflow-hidden p-5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.32)]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 to-violet-400" />

        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <SidebarNavIcon name="production" className="h-[17px] w-[17px]" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-indigo-600">
              Definición técnica
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
              Requisitos técnicos
            </h2>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              Puedes especificar el material o pedir apoyo para definirlo.
            </p>
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
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
                    ? 'relative overflow-hidden rounded-xl border border-blue-300 bg-blue-50/75 p-3.5 text-left shadow-sm ring-2 ring-blue-100'
                    : 'rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-left transition hover:border-slate-300 hover:bg-white'
                }
              >
                {selected ? (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    ✓
                  </span>
                ) : null}
                <p className="pr-7 text-[11px] font-semibold text-slate-950">
                  {option.title}
                </p>
                <p className="mt-1 text-[9px] leading-4 text-slate-500">
                  {option.detail}
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-4">
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
        </div>

        <div className="mt-4 flex gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
            i
          </span>
          <p className="text-[10px] leading-5 text-slate-700">
            No necesitas elegir el proceso de fabricación. Comercial e
            Ingeniería lo determinan durante la revisión.
          </p>
        </div>
      </Card>

      <Card className="relative overflow-hidden p-5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)]">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-400" />

        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <SidebarNavIcon name="documents" className="h-[17px] w-[17px]" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-teal-700">
              Archivos de apoyo
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
              Documentos
            </h2>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              Planos, fotografías o referencias. Máximo 5 archivos de 25 MB.
            </p>
          </div>
        </div>

        <label className="group mt-4 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-5 text-center transition hover:border-blue-300 hover:bg-blue-50/45">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-light text-blue-600 shadow-sm transition group-hover:border-blue-200">
            +
          </span>
          <span className="mt-2 text-[10px] font-semibold text-slate-800">
            Agregar archivos
          </span>
          <span className="mt-1 text-[9px] text-slate-500">
            Selecciona uno o varios documentos
          </span>
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
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-700">
            {documentError}
          </p>
        ) : null}

        <div className="mt-4 space-y-2">
          {documents.length > 0 ? (
            documents.map((document, index) => (
              <div
                key={`${document.file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-slate-800">
                    {document.file.name}
                  </p>
                  <p className="mt-0.5 text-[8px] text-slate-500">
                    {(document.file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="shrink-0 rounded-lg px-2 py-1 text-[9px] font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Quitar
                </button>
              </div>
            ))
          ) : (
            <p className="py-2 text-center text-[9px] text-slate-400">
              Aún no has adjuntado documentos.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
