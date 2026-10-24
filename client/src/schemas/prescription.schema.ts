import { endOfDay } from 'date-fns';
import { z } from 'zod';

import { requiredText } from './common.schema';

// Same rules as the API, so most mistakes are caught before a round trip.
export const prescriptionSchema = z.object({
  medicine: requiredText('Medicine', 2, 100),
  dosage: requiredText('Dosage', 1, 100),
  duration: requiredText('Duration', 1, 60),
  instructions: z.string().trim().max(500, 'Instructions must be at most 500 characters'),
  prescribedAt: z
    .date({ error: 'Date is required' })
    .refine((date) => date <= endOfDay(new Date()), 'Date cannot be in the future'),
});

export type PrescriptionValues = z.infer<typeof prescriptionSchema>;
