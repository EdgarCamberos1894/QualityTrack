import { z } from 'zod'

export const qualityMeasurementSchema = z
  .object({
    characteristic: z
      .string()
      .trim()
      .min(1, 'Indica la característica inspeccionada.')
      .max(200, 'La característica no puede superar 200 caracteres.'),
    nominalValue: z.number(),
    lowerLimit: z.number(),
    upperLimit: z.number(),
    measuredValue: z.number(),
    unit: z
      .string()
      .trim()
      .min(1, 'Indica la unidad de medida.')
      .max(20, 'La unidad no puede superar 20 caracteres.'),
    notes: z.string().max(2000, 'Las notas no pueden superar 2000 caracteres.'),
  })
  .superRefine((values, context) => {
    if (values.lowerLimit > values.upperLimit) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lowerLimit'],
        message: 'El límite inferior no puede ser mayor al superior.',
      })
    }

    if (
      values.nominalValue < values.lowerLimit ||
      values.nominalValue > values.upperLimit
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nominalValue'],
        message: 'El valor nominal debe estar dentro del rango permitido.',
      })
    }
  })

export type QualityMeasurementFormValues = z.infer<
  typeof qualityMeasurementSchema
>
