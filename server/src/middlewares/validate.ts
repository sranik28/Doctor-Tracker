import type { RequestHandler } from 'express';
import type { output as ZodOutput, ZodType } from 'zod';

import { ApiError } from '../utils/ApiError.js';

const REQUEST_LOCATIONS = ['params', 'query', 'body'] as const;
type RequestLocation = (typeof REQUEST_LOCATIONS)[number];

export type ValidationSchemas = Partial<Record<RequestLocation, ZodType>>;

export interface ValidationIssue {
  location: RequestLocation;
  path: string;
  message: string;
}

/**
 * Validates and coerces req.params / req.query / req.body with Zod.
 * Parsed values replace the originals; failures become a 400 with per-field details.
 */
export const validate =
  (schemas: ValidationSchemas): RequestHandler =>
  (req, _res, next) => {
    const issues: ValidationIssue[] = [];

    for (const location of REQUEST_LOCATIONS) {
      const schema = schemas[location];
      if (!schema) continue;

      const result = schema.safeParse(req[location]);

      if (!result.success) {
        issues.push(
          ...result.error.issues.map((issue) => ({
            location,
            path: issue.path.map(String).join('.'),
            message: issue.message,
          })),
        );
        continue;
      }

      // Express 5 exposes req.query as a getter, so define an own property instead of assigning.
      Object.defineProperty(req, location, {
        value: result.data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    next(issues.length > 0 ? ApiError.validation(issues) : undefined);
  };

/**
 * Typed view of a request part that `validate` already parsed with the same schema,
 * e.g. `validated(listDoctorsQuerySchema, req.query)`. Express types req.query as raw strings.
 */
export const validated = <S extends ZodType>(_schema: S, value: unknown): ZodOutput<S> =>
  value as ZodOutput<S>;
