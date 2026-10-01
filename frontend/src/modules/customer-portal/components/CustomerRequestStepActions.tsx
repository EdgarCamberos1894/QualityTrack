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
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.24)]">
      <div className="mb-3">
        <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Paso {step + 1} de 3
        </p>
        <p className="mt-1 text-[9px] leading-4 text-slate-500">
          {step === 0
            ? 'Completa la información básica para continuar.'
            : step === 1
              ? 'Revisa requisitos y documentos antes de confirmar.'
              : 'Confirma la información antes de enviar.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {step === 0 ? (
          <Link
            to={`/portal/${customerId}/requests`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-[10px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </Link>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={onBack}
            disabled={pending}
            className="w-full text-[10px]"
          >
            Atrás
          </Button>
        )}

        {step === 0 ? (
          <Button
            size="sm"
            onClick={onContinue}
            className="w-full text-[10px]"
          >
            Continuar
          </Button>
        ) : step === 1 ? (
          <Button
            size="sm"
            onClick={onReview}
            className="w-full text-[10px]"
          >
            Revisar
          </Button>
        ) : (
          <Button
            size="sm"
            type="submit"
            disabled={pending}
            className="w-full text-[10px]"
          >
            {pending ? 'Enviando…' : 'Enviar'}
          </Button>
        )}
      </div>
    </div>
  )
}
