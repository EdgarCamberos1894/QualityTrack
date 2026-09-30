import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  attachDeliveryEvidenceSchema,
  type AttachDeliveryEvidenceFormValues,
} from '../schemas/delivery.schemas'
import type { DeliveryDto } from '../types/delivery.types'
import type { DeliveryEvidenceOption } from './CompleteDeliveryDialog'

interface DeliveryEvidenceDialogProps {
  delivery: DeliveryDto | null
  options: DeliveryEvidenceOption[]
  submitting: boolean
  uploading: boolean
  error: unknown
  uploadError: unknown
  onClose: () => void
  onSubmit: (values: AttachDeliveryEvidenceFormValues) => Promise<boolean>
  onUpload: (file: File) => Promise<boolean>
}

const MAX_FILE_SIZE = 25 * 1024 * 1024

export function DeliveryEvidenceDialog({
  delivery,
  options,
  submitting,
  uploading,
  error,
  uploadError,
  onClose,
  onSubmit,
  onUpload,
}: DeliveryEvidenceDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttachDeliveryEvidenceFormValues>({
    resolver: zodResolver(attachDeliveryEvidenceSchema),
    defaultValues: { documentVersionId: '' },
  })

  if (!delivery) return null

  const busy = submitting || uploading

  const close = () => {
    reset()
    setFile(null)
    setFileError(null)
    onClose()
  }

  const submitExisting = handleSubmit(async (values) => {
    if (await onSubmit(values)) close()
  })

  const upload = async () => {
    setFileError(null)

    if (!file) {
      setFileError('Selecciona el archivo de evidencia.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('El archivo no puede superar 25 MB.')
      return
    }

    if (await onUpload(file)) close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-evidence-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">
            Entrega #{delivery.id}
          </p>
          <h2
            id="delivery-evidence-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            {delivery.evidenceDocumentVersionId
              ? 'Actualizar evidencia'
              : 'Agregar evidencia de entrega'}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Puedes subir el archivo desde aquí. Si la entrega ya tiene
            evidencia, la nueva carga se conserva como otra versión del mismo
            documento.
          </p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-xs font-semibold text-slate-900">
              Subir archivo
            </p>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              El documento quedará como DELIVERY_EVIDENCE dentro del mismo
              expediente y se vinculará automáticamente a esta entrega.
            </p>

            <input
              type="file"
              disabled={busy}
              onChange={(event) => {
                setFileError(null)
                setFile(event.target.files?.[0] ?? null)
              }}
              className="mt-3 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700"
            />

            {fileError ? (
              <p className="mt-2 text-xs text-amber-700">{fileError}</p>
            ) : null}

            {uploadError ? (
              <p className="mt-2 text-xs text-red-700">
                {getErrorMessage(uploadError)}
              </p>
            ) : null}

            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                onClick={() => void upload()}
                disabled={busy}
              >
                {uploading ? 'Subiendo…' : 'Subir y vincular'}
              </Button>
            </div>
          </div>

          {options.length > 0 ? (
            <form
              className="rounded-xl border border-slate-200 p-4"
              onSubmit={(event) => void submitExisting(event)}
            >
              <p className="text-xs font-semibold text-slate-900">
                Vincular una versión existente
              </p>
              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                Úsalo si la evidencia ya fue cargada previamente al expediente.
              </p>

              <label
                htmlFor="evidence-version"
                className="mb-2 mt-3 block text-sm font-semibold text-slate-800"
              >
                Documento
              </label>
              <select
                id="evidence-version"
                disabled={busy}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                {...register('documentVersionId')}
              >
                <option value="">Selecciona una evidencia</option>
                {options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>

              {errors.documentVersionId ? (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.documentVersionId.message}
                </p>
              ) : null}

              {error ? (
                <p className="mt-2 text-xs text-red-700">
                  {getErrorMessage(error)}
                </p>
              ) : null}

              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  type="submit"
                  disabled={busy}
                >
                  {submitting ? 'Vinculando…' : 'Vincular existente'}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-[10px] leading-5 text-slate-500">
              No hay otras evidencias cargadas en el expediente. Puedes crear
              la primera usando el archivo de arriba.
            </p>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={close} disabled={busy}>
            Cerrar
          </Button>
        </div>
      </section>
    </div>
  )
}
