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
        labelClassName="!mb-1.5 !text-[10px]"
        className="!h-9 !rounded-lg !px-2.5 !pr-16 !text-[10px] !shadow-none placeholder:!text-[9px]"
        error={passwordError}
        endAdornment={
          <button
            type="button"
            className="text-[8px] font-semibold text-slate-500 hover:text-slate-900"
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
        labelClassName="!mb-1.5 !text-[10px]"
        className="!h-9 !rounded-lg !px-2.5 !text-[10px] !shadow-none placeholder:!text-[9px]"
        error={confirmError}
        {...confirmRegistration}
      />
    </>
  )
}
