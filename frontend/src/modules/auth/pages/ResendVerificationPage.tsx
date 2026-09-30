import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { AuthResultPanel } from '../components/AuthResultPanel'
import { PublicAuthLayout } from '../components/PublicAuthLayout'
import { useResendVerification } from '../hooks/usePublicAuth'
import {
  emailActionSchema,
  type EmailActionFormValues,
} from '../schemas/publicAuth.schemas'

export function ResendVerificationPage() {
  const mutation = useResendVerification()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailActionFormValues>({
    resolver: zodResolver(emailActionSchema),
    defaultValues: { email: '' },
  })

  if (mutation.isSuccess) {
    return (
      <PublicAuthLayout
        eyebrow="Verificación"
        title="Revisa tu correo"
        description="Si la cuenta sigue pendiente de verificación, enviaremos un nuevo enlace."
        footer={
          <Link className="font-semibold text-blue-600" to="/login">
            Volver al inicio de sesión
          </Link>
        }
      >
        <AuthResultPanel
          tone="success"
          title="Solicitud recibida"
          description="Revisa también la carpeta de correo no deseado. Por seguridad, no confirmamos si una cuenta existe."
        />
      </PublicAuthLayout>
    )
  }

  const submit = handleSubmit((values) =>
    mutation.mutate(values.email.trim()),
  )

  return (
    <PublicAuthLayout
      eyebrow="Verificación"
      title="Reenviar correo"
      description="Ingresa el correo de la cuenta que todavía necesita ser verificada."
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
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        {mutation.error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {getErrorMessage(mutation.error)}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Enviando…' : 'Enviar nuevo enlace'}
        </Button>
      </form>
    </PublicAuthLayout>
  )
}
