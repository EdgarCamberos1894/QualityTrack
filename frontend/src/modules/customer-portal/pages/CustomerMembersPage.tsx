import { useState } from 'react'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { InviteCustomerMemberDialog } from '../components/InviteCustomerMemberDialog'
import { RemoveCustomerMemberDialog } from '../components/RemoveCustomerMemberDialog'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import {
  useCustomerInvitations,
  useCustomerMembers,
} from '../hooks/useCustomerCompany'
import { useCustomerCompanyMutations } from '../hooks/useCustomerCompanyMutations'
import {
  formatCustomerCompanyDate,
  getCustomerMemberInitials,
  getCustomerRoleLabel,
} from '../model/customerCompanyPresenter'
import type { CustomerInvitationFormValues } from '../schemas/customerCompany.schemas'
import type { CustomerMemberDto } from '../types/customerCompany.types'

type View = 'members' | 'invitations'

export function CustomerMembersPage() {
  const { customer } = useCustomerPortalContext()
  const isAdmin = customer.role === 'ADMIN'
  const membersQuery = useCustomerMembers(customer.customerId)
  const invitationsQuery = useCustomerInvitations(customer.customerId, isAdmin)
  const mutations = useCustomerCompanyMutations(customer.customerId)
  const [view, setView] = useState<View>('members')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<CustomerMemberDto | null>(
    null,
  )

  if (membersQuery.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando miembros…" />
      </PageContainer>
    )
  }

  if (membersQuery.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={membersQuery.error}
          title="No pudimos cargar los miembros"
        />
      </PageContainer>
    )
  }

  const members = membersQuery.data
  const invitations = invitationsQuery.data ?? []
  const adminCount = members.filter((member) => member.role === 'ADMIN').length

  const invite = async (values: CustomerInvitationFormValues) => {
    try {
      await mutations.invite.mutateAsync({
        email: values.email.trim(),
        role: values.role,
      })
      return true
    } catch {
      return false
    }
  }

  const remove = async () => {
    if (!removeTarget) return false

    try {
      await mutations.removeMember.mutateAsync(removeTarget.userId)
      setRemoveTarget(null)
      return true
    } catch {
      return false
    }
  }

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Miembros</h1>
          <p className="mt-2 text-sm text-slate-600">
            Personas con acceso a {customer.customerName}.
          </p>
        </div>
        {isAdmin ? (
          <Button
            onClick={() => {
              mutations.invite.reset()
              setInviteOpen(true)
            }}
          >
            Invitar miembro
          </Button>
        ) : null}
      </div>

      <Card className="grid overflow-hidden sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
        <div className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Miembros activos</p>
          <p className="mt-1 text-xl font-bold text-slate-950">
            {members.length}
          </p>
        </div>
        <button
          type="button"
          disabled={!isAdmin}
          onClick={() => setView('invitations')}
          className="px-5 py-4 text-left disabled:cursor-default"
        >
          <p className="text-[10px] text-slate-500">Invitaciones pendientes</p>
          <p className="mt-1 text-xl font-bold text-slate-950">
            {isAdmin && !invitationsQuery.isPending ? invitations.length : '—'}
          </p>
        </button>
        <div className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Administradores</p>
          <p className="mt-1 text-xl font-bold text-slate-950">{adminCount}</p>
        </div>
      </Card>

      <div className="mt-5 flex gap-2">
        <Button
          size="sm"
          variant={view === 'members' ? 'primary' : 'secondary'}
          onClick={() => setView('members')}
        >
          Miembros
        </Button>
        {isAdmin ? (
          <Button
            size="sm"
            variant={view === 'invitations' ? 'primary' : 'secondary'}
            onClick={() => setView('invitations')}
          >
            Invitaciones pendientes
          </Button>
        ) : null}
      </div>

      {view === 'members' ? (
        <Card className="mt-4 overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
              Miembro · Acceso · Estado
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <article
                key={member.membershipId}
                className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_190px_120px_auto] md:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-semibold text-teal-700">
                    {getCustomerMemberInitials(
                      member.firstName,
                      member.lastName,
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-950">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-slate-500">
                      {member.email}
                    </p>
                  </div>
                </div>

                <Badge tone="info">{getCustomerRoleLabel(member.role)}</Badge>
                <Badge tone="success">Activo</Badge>

                {isAdmin ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      mutations.removeMember.reset()
                      setRemoveTarget(member)
                    }}
                  >
                    Retirar
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="mt-4 overflow-hidden">
          {invitationsQuery.isPending ? (
            <div className="p-5">
              <LoadingState label="Cargando invitaciones…" />
            </div>
          ) : invitationsQuery.isError ? (
            <div className="p-5">
              <ErrorState
                error={invitationsQuery.error}
                title="No pudimos cargar las invitaciones"
              />
            </div>
          ) : invitations.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              No hay invitaciones pendientes.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {invitations.map((invitation) => (
                <article
                  key={invitation.id}
                  className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1fr)_190px_140px] md:items-center"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-950">
                      {invitation.email}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Enviada {formatCustomerCompanyDate(invitation.createdAt)}{' '}
                      · vence {formatCustomerCompanyDate(invitation.expiresAt)}
                    </p>
                  </div>
                  <Badge tone="info">
                    {getCustomerRoleLabel(invitation.role)}
                  </Badge>
                  <Badge tone="warning">Pendiente</Badge>
                </article>
              ))}
            </div>
          )}
        </Card>
      )}

      {!isAdmin ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] text-slate-600">
          Tu rol puede consultar los miembros, pero solo un administrador puede
          invitar o retirar accesos.
        </p>
      ) : null}

      <InviteCustomerMemberDialog
        open={inviteOpen}
        submitting={mutations.invite.isPending}
        error={mutations.invite.error}
        onClose={() => {
          mutations.invite.reset()
          setInviteOpen(false)
        }}
        onSubmit={invite}
      />

      <RemoveCustomerMemberDialog
        member={removeTarget}
        submitting={mutations.removeMember.isPending}
        error={mutations.removeMember.error}
        onClose={() => {
          mutations.removeMember.reset()
          setRemoveTarget(null)
        }}
        onConfirm={remove}
      />
    </PageContainer>
  )
}
