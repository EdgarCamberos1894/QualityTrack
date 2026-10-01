import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'
import { useLogin } from '../hooks/useLogin'

interface LoginFormProps {
  onAuthenticated: () => void
}

export function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values)
    onAuthenticated()
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <TextField
        label="Correo electrónico"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="nombre@empresa.com"
        labelClassName="!mb-1.5 !text-[10px]"
        className="!h-9 !rounded-lg !px-2.5 !text-[10px] !shadow-none placeholder:!text-[9px]"
        error={errors.email?.message}
        {...register('email')}
      />

      <TextField
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="Ingresa tu contraseña"
        labelClassName="!mb-1.5 !text-[10px]"
        className="!h-9 !rounded-lg !px-2.5 !pr-16 !text-[10px] !shadow-none placeholder:!text-[9px]"
        error={errors.password?.message}
        endAdornment={
          <button
            type="button"
            className="text-[8px] font-semibold text-slate-500 hover:text-slate-900"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        }
        {...register('password')}
      />

      {loginMutation.isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700"
        >
          {getErrorMessage(loginMutation.error)}
        </div>
      ) : null}

      <Button
        type="submit"
        className="!h-9 w-full !text-[10px]"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Ingresando…' : 'Iniciar sesión'}
      </Button>
    </form>
  )
}
