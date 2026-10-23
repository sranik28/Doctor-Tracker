import { createHash } from 'node:crypto';

/** SHA-256 hex digest, used for high-entropy secrets such as refresh tokens. */
export const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');
