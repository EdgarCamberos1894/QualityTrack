import type { ReactNode } from 'react'
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
  actions: ReactNode
}

function getFileExtension(fileName: string) {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.at(-1)?.toUpperCase() : 'DOC'
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
  actions,
}: CustomerRequestRequirementsStepProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]">
      <Card className="p-3.5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)]">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Requisitos técnicos
          </h2>
          <p className="mt-1 text-[10px] leading-5 text-slate-500">
            Puedes especificar el material o pedir apoyo para definirlo.
          </p>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
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
                    ? 'flex items-start gap-3 rounded-xl border border-blue-500 bg-blue-50/70 p-3.5 text-left shadow-sm'
                    : 'flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-left transition hover:border-slate-300 hover:bg-white'
                }
              >
                <span
                  className={
                    selected
                      ? 'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white'
                      : 'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white'
                  }
                >
                  {selected ? '✓' : ''}
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold text-slate-950">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-[9px] leading-4 text-slate-500">
                    {option.detail}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-3 [&_label]:mb-1.5 [&_label]:text-[11px] [&_p]:mt-1 [&_p]:text-[9px]">
          <TextareaField
            label={
              materialRequirementType === 'SPECIFIED'
                ? 'Material / norma / requisitos'
                : 'Contexto para la asesoría'
            }
            className="!min-h-20 !px-3 !py-2 !text-[11px] !leading-4"
            maxLength={2000}
            hint="Incluye tolerancias, condiciones de uso u otros requisitos que ya conozcas."
            error={errors.materialRequirement?.message}
            {...register('materialRequirement')}
          />
        </div>

        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/65 px-3 py-2.5">
          <p className="text-[9px] leading-4 text-slate-700">
            No necesitas elegir el proceso de fabricación. Comercial e
            Ingeniería lo determinan durante la revisión.
          </p>
        </div>
      </Card>

      <div className="space-y-3">
        <Card className="p-3.5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.24)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Documentos
              </h2>
              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                Planos, fotos, especificaciones u otra referencia útil.
              </p>
            </div>

            {documents.length > 0 ? (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-semibold text-slate-600">
                {documents.length} / 5
              </span>
            ) : null}
          </div>

          <label className="group mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/35 px-3.5 py-3 transition hover:border-blue-400 hover:bg-blue-50/60">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-light text-blue-600 shadow-sm ring-1 ring-blue-100 transition group-hover:ring-blue-200">
              +
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold text-blue-700">
                Agregar archivos
              </span>
              <span className="mt-0.5 block text-[8px] leading-4 text-slate-500">
                Selecciona hasta 5 archivos de máximo 25 MB.
              </span>
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

          <div className="mt-3 space-y-2">
            {documents.map((document, index) => (
              <div
                key={`${document.file.name}-${index}`}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 3h7l4 4v14H7z" />
                    <path d="M14 3v5h5" />
                    <path d="M10 13h5M10 16h5" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold text-slate-800">
                    {document.file.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-[8px] text-slate-500">
                    <span>
                      {(document.file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{getFileExtension(document.file.name)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  aria-label={`Eliminar ${document.file.name}`}
                  title="Eliminar archivo"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 7h16" />
                    <path d="M9 7V4h6v3" />
                    <path d="m7 7 1 13h8l1-13" />
                    <path d="M10 11v5M14 11v5" />
                  </svg>
                </button>
              </div>
            ))}

            {documents.length === 0 ? (
              <p className="py-1 text-center text-[8px] text-slate-400">
                Aún no hay documentos adjuntos.
              </p>
            ) : null}
          </div>

          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-emerald-700">
              Trazabilidad de documentos
            </p>
            <p className="mt-1 text-[8px] leading-4 text-emerald-800/80">
              Los archivos quedan vinculados a la solicitud y sus versiones
              posteriores mantienen el historial.
            </p>
          </div>
        </Card>

        {actions}
      </div>
    </div>
  )
}
