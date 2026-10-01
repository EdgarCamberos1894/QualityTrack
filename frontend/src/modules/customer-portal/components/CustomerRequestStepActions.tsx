import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'

interface CustomerRequestStepActionsProps {
  step: number
  customerId: number
  pending: boolean
  onBack: () => void
  onContinue: () => void
  onReview: () => void
}

export function CustomerRequestStepActions({
  step,
  customerId,
  pending,
  onBack,
  onContinue,
  onReview,
}: CustomerRequestStepActionsProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Paso {step + 1} de 3
        </p>
        <p className="mt-0.5 text-[9px] text-slate-500">
          {step === 0
            ? 'Completa la información básica para continuar.'
            : step === 1
              ? 'Revisa requisitos y documentos antes de confirmar.'
              : 'Confirma la información antes de enviar.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {step === 0 ? (
          <Link
            to={`/portal/${customerId}/requests`}
            className="inline-flex h-10 min-w-32 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </Link>
        ) : (
          <Button
            variant="secondary"
            onClick={onBack}
            disabled={pending}
            className="min-w-32"
          >
            Atrás
          </Button>
        )}

        {step === 0 ? (
          <Button onClick={onContinue} className="min-w-40">
            Continuar
          </Button>
        ) : step === 1 ? (
          <Button onClick={onReview} className="min-w-44">
            Revisar solicitud
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={pending}
            className="min-w-44"
          >
            {pending ? 'Enviando…' : 'Enviar solicitud'}
          </Button>
        )}
      </div>
    </div>
  )
}
