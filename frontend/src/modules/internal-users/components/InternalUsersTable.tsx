import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  formatInternalUserDate,
  getInternalRoleLabel,
  getInternalUserInitials,
  getInternalUserStatusPresentation,
} from '../model/internalUserPresenter'
import type { InternalUserDto } from '../types/internalUser.types'

interface InternalUsersTableProps {
  users: InternalUserDto[]
  currentUserId: string
  onManage: (user: InternalUserDto) => void
}

export function InternalUsersTable({
  users,
  currentUserId,
  onManage,
}: InternalUsersTableProps) {
  return (
    <div className="divide-y divide-slate-100">
      {users.map((user) => {
        const status = getInternalUserStatusPresentation(user.status)
        const isSelf = String(user.id) === currentUserId

        return (
          <article
            key={user.id}
            className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(220px,1.2fr)_minmax(260px,1fr)_150px_130px_120px] lg:items-center"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-semibold text-teal-700">
                {getInternalUserInitials(user)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-xs font-semibold text-slate-950">
                    {user.firstName} {user.lastName}
                  </p>
                  {isSelf ? (
                    <Badge tone="neutral" className="text-[9px]">
                      Tu cuenta
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-[10px] text-slate-500">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {user.roles.map((role) => (
                <Badge key={role} tone="info" className="text-[9px]">
                  {getInternalRoleLabel(role)}
                </Badge>
              ))}
            </div>

            <Badge tone={status.tone}>{status.label}</Badge>

            <p className="text-[10px] text-slate-500">
              {formatInternalUserDate(user.createdAt)}
            </p>

            <div className="lg:text-right">
              <Button
                size="sm"
                variant="secondary"
                disabled={isSelf}
                onClick={() => onManage(user)}
              >
                {isSelf ? 'Tu acceso' : 'Administrar'}
              </Button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
