import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { getApiErrorBody } from './api-error';

interface FieldIssue {
  path: string;
  message: string;
}

const isFieldIssue = (value: unknown): value is FieldIssue =>
  typeof value === 'object' &&
  value !== null &&
  'path' in value &&
  typeof value.path === 'string' &&
  'message' in value &&
  typeof value.message === 'string';

/**
 * Puts API errors on the form fields they belong to:
 * - 400 VALIDATION_ERROR details `[{ path, message }]`
 * - 409 duplicates with details `{ field }` (e.g. DUPLICATE_EMAIL)
 * Returns true if at least one field error was set.
 */
export const applyApiFieldErrors = <T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean => {
  const body = getApiErrorBody(error);
  if (!body) return false;

  const isKnownField = (field: string): field is Path<T> => fields.some((known) => known === field);

  const issues: FieldIssue[] = Array.isArray(body.details)
    ? body.details.filter(isFieldIssue)
    : typeof body.details === 'object' &&
        body.details !== null &&
        'field' in body.details &&
        typeof body.details.field === 'string'
      ? [{ path: body.details.field, message: body.message }]
      : [];

  let applied = false;
  for (const { path, message } of issues) {
    if (!isKnownField(path)) continue;
    setError(path, { type: 'server', message }, { shouldFocus: !applied });
    applied = true;
  }
  return applied;
};
