import { useEffect, useState } from 'react'
import type { MaterialDto, MaterialLotDto } from '@/modules/materials'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'

interface MaterialCertificateDialogProps {
  material: MaterialDto
  lot: MaterialLotDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (file: File) => Promise<boolean>
}

const MAX_FILE_SIZE = 25 * 1024 * 1024

export function MaterialCertificateDialog({
  material,
  lot,
  submitting,
  error,
  onClose,
  onSubmit,
}: MaterialCertificateDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    if (!lot) {
      setFile(null)
      setFileError(null)
    }
  }, [lot])

  if (!lot) return null

  const close = () => {
    setFile(null)
    setFileError(null)
    onClose()
  }

  const submit = async () => {
    setFileError(null)

    if (!file) {
      setFileError('Selecciona el archivo del certificado.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('El archivo no puede superar 25 MB.')
      return
    }

    if (await onSubmit(file)) close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="material-certificate-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            Materiales / {material.code} / {lot.lotNumber}
          </p>
          <h2
            id="material-certificate-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            {lot.certificateDocumentVersionId
              ? 'Actualizar certificado'
              : 'Adjuntar certificado'}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            El archivo pertenece al lote global. Si ya existe un certificado,
            esta carga se guardará como una nueva versión del mismo documento.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          {lot.certificateFileName ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Versión vigente
              </p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                {lot.certificateFileName}
              </p>
            </div>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-800">
              Archivo del certificado
            </span>
            <input
              type="file"
              disabled={submitting}
              onChange={(event) => {
                setFileError(null)
                setFile(event.target.files?.[0] ?? null)
              }}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Máximo 25 MB. PDF, imagen u otro archivo técnico compatible.
            </p>
          </label>

          {fileError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {fileError}
            </p>
          ) : null}

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
          <Button onClick={() => void submit()} disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar certificado'}
          </Button>
        </div>
      </section>
    </div>
  )
}
