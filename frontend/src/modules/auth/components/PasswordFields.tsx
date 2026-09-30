import { useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { TextField } from '@/shared/components/ui/TextField'

interface PasswordFieldsProps {
  passwordRegistration: UseFormRegisterReturn
  confirmRegistration: UseFormRegisterReturn
  passwordError?: string
  confirmError?: string
  passwordLabel?: string
}

export function PasswordFields({
  passwordRegistration,
  confirmRegistration,
  passwordError,
  confirmError,
  passwordLabel = 'Contraseña',
}: PasswordFieldsProps) {
  const [show, setShow] = useState(false)

  return (
    <>
      <TextField
        label={passwordLabel}
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        hint="Mínimo 8 caracteres."
        error={passwordError}
        endAdornment={
          <button
            type="button"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            onClick={() => setShow((current) => !current)}
          >
            {show ? 'Ocultar' : 'Mostrar'}
          </button>
        }
        {...passwordRegistration}
      />
      <TextField
        label="Confirmar contraseña"
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        error={confirmError}
        {...confirmRegistration}
      />
    </>
  )
}
