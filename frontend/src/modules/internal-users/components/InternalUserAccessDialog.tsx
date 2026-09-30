import { useEffect, useMemo, useState } from 'react'
import type { SystemRole } from '@/modules/auth'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  getInternalRoleDescription,
  getInternalRoleLabel,
  getInternalUserStatusPresentation,
  internalRoles,
} from '../model/internalUserPresenter'
import type {
  InternalUserAccessStatus,
  InternalUserDto,
} from '../types/internalUser.types'

interface InternalUserAccessDialogProps {
  user: InternalUserDto | null
  rolesSubmitting: boolean
  statusSubmitting: boolean
  rolesError: unknown
  statusError: unknown
  onClose: () => void
  onSaveRoles: (roles: SystemRole[]) => Promise<boolean>
  onChangeStatus: (status: InternalUserAccessStatus) => Promise<boolean>
}

export function InternalUserAccessDialog({
  user,
  rolesSubmitting,
  statusSubmitting,
  rolesError,
  statusError,
  onClose,
  onSaveRoles,
  onChangeStatus,
}: InternalUserAccessDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<SystemRole[]>([])

  useEffect(() => {
    setSelectedRoles(user?.roles ?? [])
  }, [user])

  const rolesChanged = useMemo(() => {
    if (!user) return false
    if (user.roles.length !== selectedRoles.length) return true
    return user.roles.some((role) => !selectedRoles.includes(role))
  }, [selectedRoles, user])

  if (!user) return null

  const status = getInternalUserStatusPresentation(user.status)
  const pending =
    user.status === 'PENDING_ACTIVATION' ||
    user.status === 'PENDING_VERIFICATION'

  const toggleRole = (role: SystemRole) => {
    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    )
  }

  const saveRoles = async () => {
    if (selectedRoles.length === 0) return
    await onSaveRoles(selectedRoles)
  }

  const nextStatus: InternalUserAccessStatus =
    user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="internal-user-access-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">
              Administración / Acceso interno
            </p>
            <h2
              id="internal-user-access-title"
              className="mt-1 text-lg font-semibold text-slate-950"
            >
              {user.firstName} {user.lastName}
            </h2>
            <p className="mt-1 text-xs text-slate-500">{user.email}</p>
          </div>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>

        <div className="space-y-6 px-6 py-5">
          <section>
            <h3 className="text-sm font-semibold text-slate-950">
              Roles internos
            </h3>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              Selecciona las funciones que esta persona puede realizar. Debe
              conservar al menos un rol.
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {internalRoles.map((role) => {
                const selected = selectedRoles.includes(role)

                return (
                  <label
                    key={role}
                    className={
                      selected
                        ? 'flex cursor-pointer gap-3 rounded-xl border border-blue-500 bg-blue-50 p-3'
                        : 'flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100'
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={rolesSubmitting || statusSubmitting}
                      onChange={() => toggleRole(role)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span>
                      <span className="block text-xs font-semibold text-slate-950">
                        {getInternalRoleLabel(role)}
                      </span>
                      <span className="mt-1 block text-[9px] leading-4 text-slate-500">
                        {getInternalRoleDescription(role)}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>

            {selectedRoles.length === 0 ? (
              <p className="mt-2 text-xs text-red-600">
                El usuario debe conservar al menos un rol.
              </p>
            ) : null}

            {rolesError ? (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                {getErrorMessage(rolesError)}
              </p>
            ) : null}

            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                disabled={
                  !rolesChanged ||
                  selectedRoles.length === 0 ||
                  rolesSubmitting ||
                  statusSubmitting
                }
                onClick={() => void saveRoles()}
              >
                {rolesSubmitting ? 'Guardando…' : 'Guardar roles'}
              </Button>
            </div>
          </section>

          <section className="border-t border-slate-200 pt-5">
            <h3 className="text-sm font-semibold text-slate-950">
              Estado de acceso
            </h3>

            {pending ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold text-amber-900">
                  Activación pendiente
                </p>
                <p className="mt-1 text-[10px] leading-5 text-amber-800">
                  Esta cuenta se activará únicamente cuando la persona complete
                  la invitación y establezca su contraseña. No puede activarse
                  manualmente desde administración.
                </p>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {user.status === 'SUSPENDED'
                      ? 'Acceso suspendido'
                      : 'Acceso habilitado'}
                  </p>
                  <p className="mt-1 max-w-xl text-[10px] leading-5 text-slate-500">
                    {user.status === 'SUSPENDED'
                      ? 'Reactivar permite que la cuenta vuelva a autenticarse con sus roles actuales.'
                      : 'Suspender bloquea nuevos inicios de sesión. El backend protege al último administrador activo.'}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={user.status === 'SUSPENDED' ? 'primary' : 'danger'}
                  disabled={rolesSubmitting || statusSubmitting}
                  onClick={() => void onChangeStatus(nextStatus)}
                >
                  {statusSubmitting
                    ? 'Actualizando…'
                    : user.status === 'SUSPENDED'
                      ? 'Reactivar acceso'
                      : 'Suspender acceso'}
                </Button>
              </div>
            )}

            {statusError ? (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                {getErrorMessage(statusError)}
              </p>
            ) : null}
          </section>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={rolesSubmitting || statusSubmitting}
          >
            Cerrar
          </Button>
        </div>
      </section>
    </div>
  )
}
