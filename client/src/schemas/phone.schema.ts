import { z } from 'zod';

import { isValidPhone } from '@/lib/phone';

// Kept out of common.schema so pages that don't have a phone field (login, the public site)
// don't download the phone-number metadata.
export const phoneSchema = z
  .string()
  .trim()
  .min(1, { error: 'Phone is required', abort: true })
  .refine(isValidPhone, 'Enter a valid phone number');
