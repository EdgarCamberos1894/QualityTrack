import { z } from 'zod'

const today = () => new Date().toISOString().slice(0, 10)

export const customerRequestFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Indica el nombre del trabajo.')
    .max(200, 'El nombre no puede superar 200 caracteres.'),
  description: z
    .string()
    .trim()
    .min(1, 'Describe el trabajo solicitado.')
    .max(5000, 'La descripción no puede superar 5000 caracteres.'),
  quantity: z
    .number()
    .int('La cantidad debe ser un entero.')
    .positive('La cantidad debe ser mayor a cero.'),
  requestedDeliveryDate: z
    .string()
    .refine(
      (value) => !value || value >= today(),
      'La fecha requerida no puede estar en el pasado.',
    ),
  customerReference: z
    .string()
    .max(120, 'La referencia no puede superar 120 caracteres.'),
  materialRequirementType: z.enum(['SPECIFIED', 'ASSISTANCE_REQUIRED']),
  materialRequirement: z
    .string()
    .trim()
    .min(1, 'Indica el material o el contexto para recibir asesoría.')
    .max(2000, 'El requisito técnico no puede superar 2000 caracteres.'),
})

export const respondInformationSchema = z.object({
  response: z
    .string()
    .trim()
    .min(1, 'La respuesta es obligatoria.')
    .max(4000, 'La respuesta no puede superar 4000 caracteres.'),
})

export const cancelCustomerRequestSchema = z.object({
  reason: z.string().max(1000, 'El motivo no puede superar 1000 caracteres.'),
})

export const requestDocumentSchema = z.object({
  name: z.string().max(255, 'El nombre no puede superar 255 caracteres.'),
})

export type CustomerRequestFormValues = z.infer<
  typeof customerRequestFormSchema
>
export type RespondInformationFormValues = z.infer<
  typeof respondInformationSchema
>
export type CancelCustomerRequestFormValues = z.infer<
  typeof cancelCustomerRequestSchema
>
export type RequestDocumentFormValues = z.infer<typeof requestDocumentSchema>
