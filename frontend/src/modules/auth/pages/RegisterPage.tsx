import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { AuthResultPanel } from '../components/AuthResultPanel'
import { PasswordFields } from '../components/PasswordFields'
import { PublicAuthLayout } from '../components/PublicAuthLayout'
import { useRegisterCustomer, useResendVerification } from '../hooks/usePublicAuth'
import {
  registerSchema,
  type RegisterFormValues,
} from '../schemas/publicAuth.schemas'

export function RegisterPage() {
  const registerMutation = useRegisterCustomer()
  const resendMutation = useResendVerification()
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const submit = handleSubmit(async (values) => {
    try {
      const response = await registerMutation.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      setRegisteredEmail(response.email)
    } catch {
      // The normalized API error is rendered below.
    }
  })

  if (registeredEmail) {
    return (
      <PublicAuthLayout
        eyebrow="Cuenta creada"
        title="Revisa tu correo"
        description="Tu cuenta está creada, pero necesitamos verificar que el correo te pertenece antes de habilitar el acceso."
        footer={
          <>
            ¿Ya verificaste tu correo?{' '}
            <Link
              className="font-semibold text-blue-600 transition hover:text-blue-700"
              to="/login"
            >
              Inicia sesión
            </Link>
          </>
        }
        immersive
      >
        <AuthResultPanel
          tone="success"
          title="Enlace de verificación enviado"
          description={`Enviamos las instrucciones a ${registeredEmail}.`}
        >
          <Button
            variant="secondary"
            className="!h-10 w-full !rounded-lg !text-[10px]"
            disabled={resendMutation.isPending || resendMutation.isSuccess}
            onClick={() => resendMutation.mutate(registeredEmail)}
          >
            {resendMutation.isPending
              ? 'Reenviando…'
              : resendMutation.isSuccess
                ? 'Correo reenviado'
                : 'Reenviar verificación'}
          </Button>
          {resendMutation.error ? (
            <p className="mt-3 text-xs text-red-700">
              {getErrorMessage(resendMutation.error)}
            </p>
          ) : null}
        </AuthResultPanel>
      </PublicAuthLayout>
    )
  }

  return (
    <PublicAuthLayout
      eyebrow="Portal de cliente"
      title="Crea tu cuenta"
      description="Registra tu acceso personal. Después de verificar el correo podrás crear tu empresa o aceptar invitaciones."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link className="font-semibold text-blue-600" to="/login">
            Inicia sesión
          </Link>
        </>
      }
      wide
      immersive
    >
      <form
        className="space-y-5"
        onSubmit={(event) => void submit(event)}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nombre"
            autoComplete="given-name"
            labelClassName="!text-[12px] !font-semibold"
            className="!h-11 !rounded-lg !px-3.5 !text-[12px] !shadow-sm placeholder:!text-[11px]"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <TextField
            label="Apellido"
            autoComplete="family-name"
            labelClassName="!text-[12px] !font-semibold"
            className="!h-11 !rounded-lg !px-3.5 !text-[12px] !shadow-sm placeholder:!text-[11px]"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          labelClassName="!text-[12px] !font-semibold"
          className="!h-11 !rounded-lg !px-3.5 !text-[12px] !shadow-sm placeholder:!text-[11px]"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordFields
          passwordRegistration={register('password')}
          confirmRegistration={register('confirmPassword')}
          passwordError={errors.password?.message}
          confirmError={errors.confirmPassword?.message}
          immersive
        />

        {registerMutation.error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] leading-4 text-red-700">
            {getErrorMessage(registerMutation.error)}
          </p>
        ) : null}

        <Button
          type="submit"
          className="!h-11 w-full !rounded-lg !text-[12px] !font-semibold"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </PublicAuthLayout>
  )
}
