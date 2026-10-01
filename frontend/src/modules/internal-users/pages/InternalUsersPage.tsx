import { useMemo, useState } from 'react'
import { useSessionStore, type SystemRole } from '@/modules/auth'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { InternalUserAccessDialog } from '../components/InternalUserAccessDialog'
import { InternalUserFilters } from '../components/InternalUserFilters'
import { InternalUsersTable } from '../components/InternalUsersTable'
import { InviteInternalUserDialog } from '../components/InviteInternalUserDialog'
import {
  useInternalUserMutations,
  useInternalUsers,
} from '../hooks/useInternalUsers'
import { matchesInternalUserSearch } from '../model/internalUserPresenter'
import type { InviteInternalUserFormValues } from '../schemas/internalUser.schemas'
import type {
  InternalUserAccessStatus,
  InternalUserDto,
  InternalUserFiltersValue,
} from '../types/internalUser.types'

const initialFilters: InternalUserFiltersValue = {
  search: '',
  role: 'ALL',
  status: 'ALL',
}

export function InternalUsersPage() {
  const session = useSessionStore((state) => state.session)
  const isAdmin = session?.user.roles.includes('ADMIN') ?? false
  const query = useInternalUsers(isAdmin)
  const mutations = useInternalUserMutations()
  const [filters, setFilters] = useState<InternalUserFiltersValue>(initialFilters)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<InternalUserDto | null>(null)

  const visibleUsers = useMemo(() => {
    const users = query.data ?? []

    return users.filter(
      (user) =>
        matchesInternalUserSearch(user, filters.search) &&
        (filters.role === 'ALL' || user.roles.includes(filters.role)) &&
        (filters.status === 'ALL' || user.status === filters.status),
    )
  }, [filters, query.data])

  if (!session || !isAdmin) {
    return (
      <PageContainer>
        <ErrorState
          error={new Error(
            'Esta sección está disponible únicamente para administradores internos.',
          )}
          title="Acceso administrativo requerido"
        />
      </PageContainer>
    )
  }

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando usuarios internos…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={query.error}
          title="No pudimos cargar los usuarios internos"
        />
      </PageContainer>
    )
  }

  const users = query.data
  const active = users.filter((user) => user.status === 'ACTIVE').length
  const pending = users.filter(
    (user) => user.status === 'PENDING_ACTIVATION',
  ).length
  const suspended = users.filter((user) => user.status === 'SUSPENDED').length

  const invite = async (values: InviteInternalUserFormValues) => {
    try {
      await mutations.invite.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        roles: values.roles,
      })
      return true
    } catch {
      return false
    }
  }

  const saveRoles = async (roles: SystemRole[]) => {
    if (!selectedUser) return false

    try {
      const updated = await mutations.updateRoles.mutateAsync({
        userId: selectedUser.id,
        payload: { roles },
      })
      setSelectedUser(updated)
      return true
    } catch {
      return false
    }
  }

  const changeStatus = async (status: InternalUserAccessStatus) => {
    if (!selectedUser) return false

    try {
      const updated = await mutations.updateStatus.mutateAsync({
        userId: selectedUser.id,
        payload: { status },
      })
      setSelectedUser(updated)
      return true
    } catch {
      return false
    }
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios y accesos"
        description="Gestiona cuentas internas, roles operativos y disponibilidad de acceso. Los roles de cliente se administran por separado dentro de cada empresa."
        actions={
          <Button
            onClick={() => {
              mutations.invite.reset()
              setInviteOpen(true)
            }}
          >
            Invitar usuario
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 @4xl/page:grid-cols-4">
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Usuarios internos</p>
          <p className="mt-1 text-xl font-bold text-slate-950">{users.length}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Activos</p>
          <p className="mt-1 text-xl font-bold text-slate-950">{active}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Invitación pendiente</p>
          <p className="mt-1 text-xl font-bold text-slate-950">{pending}</p>
        </Card>
        <Card className="px-5 py-4">
          <p className="text-[10px] text-slate-500">Suspendidos</p>
          <p className="mt-1 text-xl font-bold text-slate-950">{suspended}</p>
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">
              Acceso interno
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              {users.length} en total · {visibleUsers.length} visibles
            </p>
          </div>
          <p className="text-[10px] text-slate-500">
            Tu propio acceso debe modificarlo otro administrador.
          </p>
        </div>

        <InternalUserFilters value={filters} onChange={setFilters} />

        {visibleUsers.length > 0 ? (
          <InternalUsersTable
            users={visibleUsers}
            currentUserId={session.user.id}
            onManage={(user) => {
              mutations.updateRoles.reset()
              mutations.updateStatus.reset()
              setSelectedUser(user)
            }}
          />
        ) : (
          <div className="p-5">
            <EmptyState
              title="No hay usuarios que coincidan"
              description="Ajusta la búsqueda o los filtros para consultar otros accesos internos."
            />
          </div>
        )}
      </Card>

      <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[10px] leading-5 text-slate-600">
        Los roles internos controlan funciones del backoffice. ADMIN,
        COMMERCIAL, ENGINEERING, PRODUCTION, QUALITY, LOGISTICS y AUDITOR no se
        mezclan con ADMIN, REQUESTER o VIEWER de las empresas cliente.
      </p>

      <InviteInternalUserDialog
        open={inviteOpen}
        submitting={mutations.invite.isPending}
        error={mutations.invite.error}
        onClose={() => {
          mutations.invite.reset()
          setInviteOpen(false)
        }}
        onSubmit={invite}
      />

      <InternalUserAccessDialog
        user={selectedUser}
        rolesSubmitting={mutations.updateRoles.isPending}
        statusSubmitting={mutations.updateStatus.isPending}
        rolesError={mutations.updateRoles.error}
        statusError={mutations.updateStatus.error}
        onClose={() => {
          mutations.updateRoles.reset()
          mutations.updateStatus.reset()
          setSelectedUser(null)
        }}
        onSaveRoles={saveRoles}
        onChangeStatus={changeStatus}
      />
    </PageContainer>
  )
}
