import { Button } from '@/shared/components/ui/Button'

interface CustomerRequestStepActionsProps {
  step: number
  pending: boolean
  onBack: () => void
  onContinue: () => void
  onReview: () => void
}

export function CustomerRequestStepActions({
  step,
  pending,
  onBack,
  onContinue,
  onReview,
}: CustomerRequestStepActionsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-white via-white to-slate-50/80 p-3 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.28)]">
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

      <div className={step === 0 ? 'grid grid-cols-1' : 'grid grid-cols-2 gap-2'}>
        {step > 0 ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={onBack}
            disabled={pending}
            className="!h-8 w-full !px-3 !text-[10px]"
          >
            Atrás
          </Button>
        ) : null}

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
