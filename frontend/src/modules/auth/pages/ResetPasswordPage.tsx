import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { AuthResultPanel } from '../components/AuthResultPanel'
import { PasswordFields } from '../components/PasswordFields'
import { PublicAuthLayout } from '../components/PublicAuthLayout'
import { useResetPassword } from '../hooks/usePublicAuth'
import { getFragmentToken } from '../model/publicToken'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/publicAuth.schemas'

export function ResetPasswordPage() {
  const location = useLocation()
  const token = getFragmentToken(location.hash)
  const mutation = useResetPassword(token)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  if (!token) {
    return (
      <PublicAuthLayout
        eyebrow="Recuperación"
        title="Enlace no válido"
        description="Este enlace no contiene la información necesaria para restablecer la contraseña."
        footer={
          <Link className="font-semibold text-blue-600" to="/forgot-password">
            Solicitar otro enlace
          </Link>
        }
      >
        <AuthResultPanel
          tone="error"
          title="No encontramos el token"
          description="Abre nuevamente el enlace completo que recibiste por correo."
        />
      </PublicAuthLayout>
    )
  }

  if (mutation.isSuccess) {
    return (
      <PublicAuthLayout
        eyebrow="Recuperación"
        title="Contraseña actualizada"
        description="Ya puedes entrar a QualityTrack con tu nueva contraseña."
        footer={
          <Link className="font-semibold text-blue-600" to="/login">
            Ir al inicio de sesión
          </Link>
        }
      >
        <AuthResultPanel
          tone="success"
          title="Cambio completado"
          description="El enlace de recuperación ya fue consumido y no puede reutilizarse."
        />
      </PublicAuthLayout>
    )
  }

  const submit = handleSubmit((values) => mutation.mutate(values.password))

  return (
    <PublicAuthLayout
      eyebrow="Recuperación"
      title="Define una nueva contraseña"
      description="Elige una contraseña nueva para tu cuenta."
      footer={
        <Link className="font-semibold text-blue-600" to="/login">
          Volver al inicio de sesión
        </Link>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(event) => void submit(event)}
        noValidate
      >
        <PasswordFields
          passwordRegistration={register('password')}
          confirmRegistration={register('confirmPassword')}
          passwordError={errors.password?.message}
          confirmError={errors.confirmPassword?.message}
          passwordLabel="Nueva contraseña"
        />

        {mutation.error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {getErrorMessage(mutation.error)}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Actualizando…' : 'Guardar contraseña'}
        </Button>
      </form>
    </PublicAuthLayout>
  )
}
