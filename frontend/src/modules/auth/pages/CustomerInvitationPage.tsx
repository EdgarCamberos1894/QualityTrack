import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { AuthResultPanel } from '../components/AuthResultPanel'
import { PasswordFields } from '../components/PasswordFields'
import { PublicAuthLayout } from '../components/PublicAuthLayout'
import {
  useAcceptCustomerInvitation,
  useCompleteCustomerInvitation,
  useCustomerInvitation,
} from '../hooks/usePublicAuth'
import {
  formatAccessDateTime,
  getCustomerInvitationRoleLabel,
} from '../model/publicAuthPresenter'
import { getFragmentToken } from '../model/publicToken'
import {
  customerInvitationRegistrationSchema,
  type CustomerInvitationRegistrationFormValues,
} from '../schemas/publicAuth.schemas'

export function CustomerInvitationPage() {
  const location = useLocation()
  const token = getFragmentToken(location.hash)
  const invitationQuery = useCustomerInvitation(token)
  const acceptMutation = useAcceptCustomerInvitation(token)
  const completeMutation = useCompleteCustomerInvitation(token)
  const [registrationRequired, setRegistrationRequired] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInvitationRegistrationFormValues>({
    resolver: zodResolver(customerInvitationRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  })

  if (!token) {
    return (
      <PublicAuthLayout
        eyebrow="Invitación"
        title="Enlace no válido"
        description="La invitación no contiene el token necesario para continuar."
        footer={
          <Link className="font-semibold text-blue-600" to="/login">
            Ir al inicio de sesión
          </Link>
        }
      >
        <AuthResultPanel
          tone="error"
          title="Invitación incompleta"
          description="Abre nuevamente el enlace completo recibido por correo."
        />
      </PublicAuthLayout>
    )
  }

  if (invitationQuery.isPending) {
    return (
      <PublicAuthLayout
        eyebrow="Invitación"
        title="Revisando invitación"
        description="Estamos comprobando que el enlace siga disponible."
      >
        <LoadingState label="Validando invitación…" />
      </PublicAuthLayout>
    )
  }

  if (invitationQuery.isError) {
    return (
      <PublicAuthLayout
        eyebrow="Invitación"
        title="Invitación no disponible"
        description="El enlace puede haber expirado, ya haberse utilizado o no ser válido."
        footer={
          <Link className="font-semibold text-blue-600" to="/login">
            Ir al inicio de sesión
          </Link>
        }
      >
        <AuthResultPanel
          tone="error"
          title="No podemos abrir esta invitación"
          description={getErrorMessage(invitationQuery.error)}
        />
      </PublicAuthLayout>
    )
  }

  const invitation = invitationQuery.data

  if (accepted) {
    return (
      <PublicAuthLayout
        eyebrow="Invitación aceptada"
        title={`Ya formas parte de ${invitation.customerName}`}
        description="La membresía quedó activada para el correo al que se envió esta invitación."
        footer={
          <Link className="font-semibold text-blue-600" to="/login">
            Ir al inicio de sesión
          </Link>
        }
      >
        <AuthResultPanel
          tone="success"
          title="Acceso habilitado"
          description="Inicia sesión con la cuenta invitada. Si ya tienes una sesión abierta con esa misma cuenta, vuelve al portal para recargar tus empresas."
        />
      </PublicAuthLayout>
    )
  }

  const accept = async () => {
    try {
      const result = await acceptMutation.mutateAsync()
      if (result.outcome === 'REGISTRATION_REQUIRED') {
        setRegistrationRequired(true)
        return
      }

      setAccepted(true)
    } catch {
      // The normalized API error is rendered below.
    }
  }

  const complete = handleSubmit(async (values) => {
    try {
      await completeMutation.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        password: values.password,
      })
      setAccepted(true)
    } catch {
      // The normalized API error is rendered below.
    }
  })

  return (
    <PublicAuthLayout
      eyebrow="Invitación de empresa"
      title={`Únete a ${invitation.customerName}`}
      description={`Te invitaron con acceso de ${getCustomerInvitationRoleLabel(invitation.role).toLocaleLowerCase('es-MX')}.`}
      footer={
        <span>
          Invitación válida hasta {formatAccessDateTime(invitation.expiresAt)}.
        </span>
      }
      wide={registrationRequired}
    >
      {!registrationRequired ? (
        <div className="space-y-5">
          <AuthResultPanel
            title="Tu acceso está preparado"
            description="Al aceptar, QualityTrack comprobará si el correo invitado ya tiene una cuenta. Si todavía no existe, te pediremos únicamente los datos necesarios para crearla."
          />

          {acceptMutation.error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {getErrorMessage(acceptMutation.error)}
            </p>
          ) : null}

          <Button
            className="w-full"
            disabled={acceptMutation.isPending}
            onClick={() => void accept()}
          >
            {acceptMutation.isPending ? 'Aceptando…' : 'Aceptar invitación'}
          </Button>
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={(event) => void complete(event)}
          noValidate
        >
          <AuthResultPanel
            title="Crea tu cuenta"
            description="El correo ya está verificado por esta invitación. Completa tu nombre y establece una contraseña."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Nombre"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <TextField
              label="Apellido"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <PasswordFields
            passwordRegistration={register('password')}
            confirmRegistration={register('confirmPassword')}
            passwordError={errors.password?.message}
            confirmError={errors.confirmPassword?.message}
          />

          {completeMutation.error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {getErrorMessage(completeMutation.error)}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={completeMutation.isPending}
          >
            {completeMutation.isPending
              ? 'Creando cuenta…'
              : 'Crear cuenta y unirme'}
          </Button>
        </form>
      )}
    </PublicAuthLayout>
  )
}
