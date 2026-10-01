import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

interface CustomerRequestStepActionsProps {
  step: number
  customerId: number
  pending: boolean
  onBack: () => void
  onContinue: () => void
  onReview: () => void
  embedded?: boolean
}

export function CustomerRequestStepActions({
  step,
  customerId,
  pending,
  onBack,
  onContinue,
  onReview,
  embedded = false,
}: CustomerRequestStepActionsProps) {
  return (
    <div
      className={cn(
        embedded
          ? 'border-t border-slate-200 bg-slate-50/55 px-3.5 py-2.5'
          : 'rounded-xl border border-slate-200 bg-white p-3 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.24)]',
      )}
    >
      <div className="mb-2">
        <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Paso {step + 1} de 3
        </p>
        <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
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
            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-[10px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </Link>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={onBack}
            disabled={pending}
            className="!h-8 w-full !px-3 !text-[10px]"
          >
            Atrás
          </Button>
        )}

        {step === 0 ? (
          <Button
            size="sm"
            onClick={onContinue}
            className="!h-8 w-full !px-3 !text-[10px]"
          >
            Continuar
          </Button>
        ) : step === 1 ? (
          <Button
            size="sm"
            onClick={onReview}
            className="!h-8 w-full !px-3 !text-[10px]"
          >
            Revisar
          </Button>
        ) : (
          <Button
            size="sm"
            type="submit"
            disabled={pending}
            className="!h-8 w-full !px-3 !text-[10px]"
          >
            {pending ? 'Enviando…' : 'Enviar'}
          </Button>
        )}
      </div>
    </div>
  )
}
