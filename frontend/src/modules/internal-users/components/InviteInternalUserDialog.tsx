import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { SystemRole } from '@/modules/auth'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  getInternalRoleDescription,
  getInternalRoleLabel,
  internalRoles,
} from '../model/internalUserPresenter'
import {
  inviteInternalUserSchema,
  type InviteInternalUserFormValues,
} from '../schemas/internalUser.schemas'

interface InviteInternalUserDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: InviteInternalUserFormValues) => Promise<boolean>
}

export function InviteInternalUserDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: InviteInternalUserDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<InviteInternalUserFormValues>({
    resolver: zodResolver(inviteInternalUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      roles: [],
    },
  })

  const selectedRoles = useWatch({ control, name: 'roles' }) ?? []

  if (!open) return null

  const toggleRole = (role: SystemRole) => {
    const next = selectedRoles.includes(role)
      ? selectedRoles.filter((item) => item !== role)
      : [...selectedRoles, role]

    setValue('roles', next, { shouldValidate: true, shouldDirty: true })
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) close()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-internal-user-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700">
            Administración / Usuarios internos
          </p>
          <h2
            id="invite-internal-user-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Invitar usuario
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            La cuenta quedará pendiente hasta que la persona abra la invitación
            y establezca su contraseña.
          </p>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Nombre"
              maxLength={100}
              disabled={submitting}
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <TextField
              label="Apellido"
              maxLength={100}
              disabled={submitting}
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <TextField
            label="Correo electrónico"
            type="email"
            maxLength={254}
            disabled={submitting}
            error={errors.email?.message}
            {...register('email')}
          />

          <fieldset>
            <legend className="text-sm font-semibold text-slate-800">
              Roles internos
            </legend>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              Puedes asignar más de un rol. Los permisos se aplican por función
              operativa.
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
                      disabled={submitting}
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

            {errors.roles?.message ? (
              <p className="mt-2 text-xs text-red-600">
                {errors.roles.message}
              </p>
            ) : null}
          </fieldset>

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Enviando…' : 'Enviar invitación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
