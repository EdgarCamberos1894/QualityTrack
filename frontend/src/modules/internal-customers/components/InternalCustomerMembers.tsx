import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import {
  formatInternalCustomerDate,
  getInternalCustomerRoleLabel,
  getMemberInitials,
} from '../model/internalCustomerPresenter'
import type { InternalCustomerMemberDto } from '../types/internalCustomer.types'

interface InternalCustomerMembersProps {
  members: InternalCustomerMemberDto[]
}

export function InternalCustomerMembers({
  members,
}: InternalCustomerMembersProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-950">
          Miembros activos
        </h2>
        <p className="mt-1 text-[10px] text-slate-500">
          {members.length} usuarios con acceso actual a esta empresa.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {members.map((member) => (
          <div
            key={member.membershipId}
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-bold text-slate-700">
                {getMemberInitials(member.firstName, member.lastName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-950">
                  {member.firstName} {member.lastName}
                </p>
                <p className="mt-1 truncate text-[10px] text-slate-500">
                  {member.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:text-right">
              <Badge tone="info">{getInternalCustomerRoleLabel(member.role)}</Badge>
              <p className="text-[9px] text-slate-500">
                Desde {formatInternalCustomerDate(member.joinedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
