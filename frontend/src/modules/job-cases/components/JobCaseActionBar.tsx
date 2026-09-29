import type { AuthenticatedUser } from '@/modules/auth'
import { Button } from '@/shared/components/ui/Button'
import { getJobCaseCapabilities } from '../model/jobCaseCapabilities'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseActionBarProps {
  jobCase: JobCaseDetailDto
  user: AuthenticatedUser
  taking: boolean
  completing: boolean
  onTake: () => void
  onRequestInformation: () => void
  onDefineMaterial: () => void
  onComplete: () => void
}

export function JobCaseActionBar({
  jobCase,
  user,
  taking,
  completing,
  onTake,
  onRequestInformation,
  onDefineMaterial,
  onComplete,
}: JobCaseActionBarProps) {
  const capabilities = getJobCaseCapabilities(jobCase, user)
  const hasActions =
    capabilities.canTake ||
    capabilities.canRequestInformation ||
    capabilities.canDefineMaterial ||
    capabilities.canAttemptComplete

  if (!hasActions) return null

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        {capabilities.canTake ? (
          <Button size="sm" onClick={onTake} disabled={taking}>
            {taking ? 'Tomando…' : 'Tomar expediente'}
          </Button>
        ) : null}

        {capabilities.canRequestInformation ? (
          <Button size="sm" variant="secondary" onClick={onRequestInformation}>
            Solicitar aclaración
          </Button>
        ) : null}

        {capabilities.canDefineMaterial ? (
          <Button size="sm" variant="secondary" onClick={onDefineMaterial}>
            {jobCase.materialSpecification
              ? 'Actualizar material'
              : 'Definir material'}
          </Button>
        ) : null}

        {capabilities.canAttemptComplete ? (
          <Button
            size="sm"
            onClick={onComplete}
            disabled={completing || !capabilities.canCompleteReview}
            title={capabilities.completeBlockReason ?? undefined}
          >
            {completing ? 'Completando…' : 'Completar revisión'}
          </Button>
        ) : null}
      </div>

      {capabilities.completeBlockReason ? (
        <p className="mt-3 text-[10px] text-amber-800">
          {capabilities.completeBlockReason}
        </p>
      ) : null}
    </section>
  )
}
