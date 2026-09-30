import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  requestDocumentSchema,
  type RequestDocumentFormValues,
} from '../schemas/customerRequest.schemas'
import type { RequestDocumentUpload } from '../types/customerRequest.types'

interface RequestDocumentDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (input: RequestDocumentUpload) => Promise<boolean>
}

export function RequestDocumentDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: RequestDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestDocumentFormValues>({
    resolver: zodResolver(requestDocumentSchema),
    defaultValues: {
      documentType: 'REQUEST_ATTACHMENT',
      name: '',
      description: '',
    },
  })

  if (!open) return null

  const close = () => {
    reset()
    setFile(null)
    setFileError(null)
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (!file) {
      setFileError('Selecciona un archivo.')
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      setFileError('El archivo no puede superar 25 MB.')
      return
    }

    if (
      await onSubmit({
        file,
        ...(values.documentType.trim()
          ? { documentType: values.documentType.trim() }
          : {}),
        ...(values.name.trim() ? { name: values.name.trim() } : {}),
        ...(values.description.trim()
          ? { description: values.description.trim() }
          : {}),
      })
    ) {
      close()
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-document-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <h2
            id="request-document-title"
            className="text-lg font-semibold text-slate-950"
          >
            Agregar documento
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Se registrará como una nueva evidencia dentro de esta solicitud.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <TextField
            label="Nombre (opcional)"
            maxLength={255}
            error={errors.name?.message}
            {...register('name')}
          />
          <TextField
            label="Tipo"
            maxLength={50}
            error={errors.documentType?.message}
            {...register('documentType')}
          />
          <TextareaField
            label="Descripción (opcional)"
            maxLength={2000}
            error={errors.description?.message}
            {...register('description')}
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              Archivo
            </label>
            <input
              type="file"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null)
                setFileError(null)
              }}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700"
            />
            {fileError ? (
              <p className="mt-1.5 text-xs text-red-600">{fileError}</p>
            ) : null}
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Subiendo…' : 'Agregar documento'}
          </Button>
        </div>
      </form>
    </div>
  )
}
