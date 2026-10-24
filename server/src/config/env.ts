import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const durationSchema = z
  .string()
  .regex(/^\d+(ms|s|m|h|d|w|y)?$/, 'must be a duration such as 15m, 1h or 7d');

const optionalString = <T extends z.ZodType<string>>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const PLACEHOLDER_SECRET = /^replace-with/i;

const envSchema = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535),
    NODE_ENV: z.enum(['development', 'production', 'test']),
    MONGODB_URI: z
      .string()
      .regex(/^mongodb(\+srv)?:\/\//, 'must start with mongodb:// or mongodb+srv://'),
    JWT_ACCESS_SECRET: z.string().min(32, 'must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'must be at least 32 characters'),
    ACCESS_TOKEN_EXPIRES_IN: durationSchema,
    REFRESH_TOKEN_EXPIRES_IN: durationSchema,
    CLIENT_URL: z.url(),
    COOKIE_DOMAIN: optionalString(z.string()),
    // Number of reverse proxies in front of Express whose X-Forwarded-For entry we trust.
    TRUST_PROXY: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.coerce.number().int().min(0).default(1),
    ),
    // Public URL of this API, pinged every 12 minutes so a free-tier host doesn't put it to
    // sleep (production only). Falls back to RENDER_EXTERNAL_URL, which Render sets itself.
    KEEP_ALIVE_URL: optionalString(z.url()),
    RENDER_EXTERNAL_URL: optionalString(z.url()),
    // Only needed by `bun run seed`; the API server runs without them.
    SEED_ADMIN_EMAIL: optionalString(z.email()),
    SEED_ADMIN_PASSWORD: optionalString(z.string().min(8, 'must be at least 8 characters')),
  })
  .superRefine((env, context) => {
    if (env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
      context.addIssue({
        code: 'custom',
        path: ['JWT_REFRESH_SECRET'],
        message: 'must be different from JWT_ACCESS_SECRET',
      });
    }

    if (env.NODE_ENV !== 'production') return;

    // Production must never run on the placeholder secrets copied from .env.example.
    for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
      if (PLACEHOLDER_SECRET.test(env[key])) {
        context.addIssue({
          code: 'custom',
          path: [key],
          message: 'is still the .env.example placeholder; generate a real secret for production',
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

const parseEnv = (): Env => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const key = issue.path.join('.');
        const message = process.env[key] === undefined ? 'is required but missing' : issue.message;
        return `  - ${key}: ${message}`;
      })
      .join('\n');

    console.error(`\n[env] Invalid environment configuration:\n${issues}\n`);
    console.error('[env] Check server/.env against server/.env.example.\n');
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
export const isProduction = env.NODE_ENV === 'production';
