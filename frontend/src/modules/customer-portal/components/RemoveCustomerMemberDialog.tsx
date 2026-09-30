import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import type { CustomerMemberDto } from '../types/customerCompany.types'

interface RemoveCustomerMemberDialogProps {
  member: CustomerMemberDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onConfirm: () => Promise<boolean>
}

export function RemoveCustomerMemberDialog({
  member,
  submitting,
  error,
  onClose,
  onConfirm,
}: RemoveCustomerMemberDialogProps) {
  if (!member) return null

  const confirm = async () => {
    if (await onConfirm()) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-member-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <h2
            id="remove-member-title"
            className="text-lg font-semibold text-slate-950"
          >
            Retirar miembro
          </h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {member.firstName} {member.lastName} perderá acceso a esta empresa.
            El backend impide retirar al último administrador activo.
          </p>
        </div>

        {error ? (
          <div className="px-6 pt-5">
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(error)}
            </p>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 px-6 py-5">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Volver
          </Button>
          <Button
            variant="danger"
            disabled={submitting}
            onClick={() => void confirm()}
          >
            {submitting ? 'Retirando…' : 'Retirar acceso'}
          </Button>
        </div>
      </section>
    </div>
  )
}
