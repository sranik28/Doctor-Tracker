import { z } from 'zod';

import { isoDateSchema, objectIdSchema, requiredText } from './common.validation.js';

export const MAX_PRESCRIPTIONS_PER_LIST = 100;
export const DEFAULT_PRESCRIPTIONS_PER_LIST = 50;

const prescriptionFields = {
  medicine: requiredText('Medicine', 2, 100),
  dosage: requiredText('Dosage', 1, 100),
  duration: requiredText('Duration', 1, 60),
  instructions: z
    .string()
    .trim()
    .max(500, 'Instructions must be at most 500 characters')
    .optional(),
  prescribedAt: isoDateSchema
    .transform((value) => new Date(value))
    .refine((date) => date.getTime() <= Date.now(), 'Prescription date cannot be in the future')
    .optional(),
};

export const createPrescriptionSchema = z.object(prescriptionFields);

/** PATCH body: any subset of the fields. Strict, so typos and _id are rejected. */
export const updatePrescriptionSchema = z
  .strictObject(prescriptionFields)
  .partial()
  .refine((input) => Object.values(input).some((value) => value !== undefined), {
    message: 'Provide at least one field to update',
    when: (payload) => payload.issues.length === 0,
  });

export const listPrescriptionsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1, 'limit must be at least 1')
    .max(MAX_PRESCRIPTIONS_PER_LIST, `limit must be at most ${MAX_PRESCRIPTIONS_PER_LIST}`)
    .default(DEFAULT_PRESCRIPTIONS_PER_LIST),
});

export const prescriptionIdParamsSchema = z.object({ id: objectIdSchema });

export type CreatePrescriptionInput = z.output<typeof createPrescriptionSchema>;
export type UpdatePrescriptionInput = z.output<typeof updatePrescriptionSchema>;
export type ListPrescriptionsQuery = z.output<typeof listPrescriptionsQuerySchema>;
