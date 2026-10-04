import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  useCustomerProfile,
  useCustomerProfileMutations,
} from '../hooks/useCustomerProfile'
import {
  changePasswordSchema,
  ownProfileSchema,
  type ChangePasswordFormValues,
  type OwnProfileFormValues,
} from '../schemas/userProfile.schemas'
import type {
  CustomerProfileRole,
  UserProfileStatus,
} from '../types/userProfile.types'

const roleLabels: Record<CustomerProfileRole, string> = {
  ADMIN: 'Administrador',
  REQUESTER: 'Solicitante',
  VIEWER: 'Consulta',
}

function getStatusLabel(status: UserProfileStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Activo'
    case 'SUSPENDED':
      return 'Suspendido'
    case 'PENDING_ACTIVATION':
      return 'Pendiente de activación'
    case 'PENDING_VERIFICATION':
      return 'Pendiente de verificación'
  }
}

function getStatusClasses(status: UserProfileStatus): string {
  if (status === 'ACTIVE') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'SUSPENDED') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

export function CustomerProfilePage() {
  const { customerId } = useParams()
  const profileQuery = useCustomerProfile()
  const mutations = useCustomerProfileMutations()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const profileForm = useForm<OwnProfileFormValues>({
    resolver: zodResolver(ownProfileSchema),
    defaultValues: { firstName: '', lastName: '' },
  })

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (!profileQuery.data) return

    profileForm.reset({
      firstName: profileQuery.data.firstName,
      lastName: profileQuery.data.lastName,
    })
  }, [profileForm, profileQuery.data])

  if (profileQuery.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando tu perfil…" />
      </PageContainer>
    )
  }

  if (profileQuery.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={profileQuery.error}
          title="No pudimos cargar tu perfil"
        />
      </PageContainer>
    )
  }

  const profile = profileQuery.data
  const selectedCustomerId = Number(customerId)
  const currentMembership = profile.memberships.find(
    (membership) => membership.customerId === selectedCustomerId,
  )

  const saveProfile = profileForm.handleSubmit(async (values) => {
    setProfileSaved(false)
    try {
      await mutations.updateProfile.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      })
      setProfileSaved(true)
    } catch {
      // El error se presenta desde el estado de la mutación.
    }
  })

  const savePassword = passwordForm.handleSubmit(async (values) => {
    setPasswordSaved(false)
    try {
      await mutations.changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      passwordForm.reset()
      setPasswordSaved(true)
      setPasswordOpen(false)
    } catch {
      // El error se presenta dentro del diálogo.
    }
  })

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="users" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Cuenta personal
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Mi perfil
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                Actualiza tus datos personales y consulta tu acceso dentro de la empresa seleccionada.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <form
          onSubmit={(event) => void saveProfile(event)}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]"
        >
          <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-3 sm:px-5">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Información personal
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Tus datos
            </h2>
            <p className="mt-1 text-[8px] leading-3 text-slate-400">
              Tu nombre se normaliza automáticamente al guardar. El correo permanece protegido como identidad de acceso.
            </p>
          </div>

          <div className="space-y-4 px-4 py-4 sm:px-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Nombre"
                maxLength={100}
                disabled={mutations.updateProfile.isPending}
                labelClassName="!mb-1.5 !text-[10px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={profileForm.formState.errors.firstName?.message}
                {...profileForm.register('firstName')}
              />
              <TextField
                label="Apellido"
                maxLength={100}
                disabled={mutations.updateProfile.isPending}
                labelClassName="!mb-1.5 !text-[10px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={profileForm.formState.errors.lastName?.message}
                {...profileForm.register('lastName')}
              />
            </div>

            <TextField
              label="Correo electrónico"
              type="email"
              value={profile.email}
              readOnly
              disabled
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !border-slate-200 !bg-slate-50 !px-2.5 !text-[10px] !text-slate-500 !shadow-none"
              hint="El cambio de correo requiere un flujo independiente de verificación."
            />

            {mutations.updateProfile.isError ? (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700"
              >
                {getErrorMessage(mutations.updateProfile.error)}
              </p>
            ) : null}

            {profileSaved ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[8px] leading-4 text-emerald-700">
                Tus datos personales se actualizaron correctamente.
              </p>
            ) : null}
          </div>

          <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-5">
            <Button
              type="submit"
              className="!h-7 !px-3 !text-[8px]"
              disabled={
                mutations.updateProfile.isPending || !profileForm.formState.isDirty
              }
            >
              {mutations.updateProfile.isPending
                ? 'Guardando…'
                : 'Guardar cambios'}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
            <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Empresa y acceso
              </p>
              <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
                Contexto actual
              </h2>
            </div>

            <div className="space-y-3 px-4 py-4 sm:px-5">
              <InfoRow
                label="Empresa"
                value={currentMembership?.customerName ?? 'Sin empresa seleccionada'}
              />
              <InfoRow
                label="Rol"
                value={
                  currentMembership
                    ? roleLabels[currentMembership.role]
                    : 'Sin rol disponible'
                }
              />
              <div className="flex items-start justify-between gap-4 border-t border-slate-100 pt-3">
                <span className="text-[8px] font-medium text-slate-400">Estado</span>
                <span
                  className={`rounded-full border px-2 py-1 text-[8px] font-semibold ${getStatusClasses(profile.status)}`}
                >
                  {getStatusLabel(profile.status)}
                </span>
              </div>

              {profile.memberships.length > 1 ? (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[8px] font-medium text-slate-400">
                    Otras empresas vinculadas
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {profile.memberships
                      .filter(
                        (membership) =>
                          membership.customerId !== selectedCustomerId,
                      )
                      .map((membership) => (
                        <div
                          key={membership.customerId}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-2"
                        >
                          <span className="truncate text-[8px] font-semibold text-slate-600">
                            {membership.customerName}
                          </span>
                          <span className="shrink-0 text-[8px] font-medium text-slate-400">
                            {roleLabels[membership.role]}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}

              <p className="border-t border-slate-100 pt-3 text-[8px] leading-4 text-slate-400">
                La empresa y el rol provienen de tu membresía. Se administran desde la sección de miembros, no desde tu perfil personal.
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
            <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Seguridad
              </p>
              <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
                Contraseña y actividad
              </h2>
            </div>

            <div className="space-y-3 px-4 py-4 sm:px-5">
              <InfoRow label="Contraseña" value="••••••••" />
              <InfoRow label="Cuenta creada" value={formatDate(profile.createdAt)} />
              <InfoRow
                label="Última actualización"
                value={formatDate(profile.updatedAt)}
              />

              {passwordSaved ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[8px] leading-4 text-emerald-700">
                  Tu contraseña se actualizó correctamente.
                </p>
              ) : null}

              <Button
                variant="secondary"
                className="!h-7 w-full !px-3 !text-[8px]"
                onClick={() => {
                  mutations.changePassword.reset()
                  passwordForm.reset()
                  setPasswordSaved(false)
                  setPasswordOpen(true)
                }}
              >
                Cambiar contraseña
              </Button>
            </div>
          </section>
        </div>
      </div>

      {passwordOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-change-password-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onSubmit={(event) => void savePassword(event)}
          >
            <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Cuenta · Seguridad
              </p>
              <h2
                id="customer-change-password-title"
                className="mt-0.5 text-[14px] font-semibold text-slate-950"
              >
                Cambiar contraseña
              </h2>
              <p className="mt-1 text-[9px] leading-4 text-slate-500">
                Confirma tu contraseña actual antes de establecer una nueva.
              </p>
            </div>

            <div className="space-y-3.5 px-4 py-4">
              <TextField
                label="Contraseña actual"
                type="password"
                autoComplete="current-password"
                disabled={mutations.changePassword.isPending}
                labelClassName="!mb-1.5 !text-[10px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register('currentPassword')}
              />
              <TextField
                label="Nueva contraseña"
                type="password"
                autoComplete="new-password"
                disabled={mutations.changePassword.isPending}
                labelClassName="!mb-1.5 !text-[10px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={passwordForm.formState.errors.newPassword?.message}
                hint="Usa al menos 8 caracteres."
                {...passwordForm.register('newPassword')}
              />
              <TextField
                label="Confirmar nueva contraseña"
                type="password"
                autoComplete="new-password"
                disabled={mutations.changePassword.isPending}
                labelClassName="!mb-1.5 !text-[10px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
              />

              {mutations.changePassword.isError ? (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700"
                >
                  {getErrorMessage(mutations.changePassword.error)}
                </p>
              ) : null}
            </div>

            <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
              <Button
                variant="secondary"
                className="!h-7 !px-2.5 !text-[8px]"
                onClick={() => {
                  passwordForm.reset()
                  mutations.changePassword.reset()
                  setPasswordOpen(false)
                }}
                disabled={mutations.changePassword.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="!h-7 !px-2.5 !text-[8px]"
                disabled={mutations.changePassword.isPending}
              >
                {mutations.changePassword.isPending
                  ? 'Actualizando…'
                  : 'Actualizar contraseña'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </PageContainer>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[8px] font-medium text-slate-400">{label}</span>
      <span className="text-right text-[9px] font-semibold text-slate-700">
        {value}
      </span>
    </div>
  )
}
