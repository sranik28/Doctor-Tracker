import axios from 'axios';

import type { ApiErrorResponse } from '@/types/api';

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse =>
  typeof value === 'object' &&
  value !== null &&
  'success' in value &&
  value.success === false &&
  'error' in value;

export const getApiErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

/** Best human-readable message for any thrown value, preferring the API's own message. */
export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (axios.isAxiosError(error)) {
    const body: unknown = error.response?.data;
    if (isApiErrorResponse(body)) return body.error.message;
    if (!error.response) return 'Unable to reach the server. Check your connection.';
  }

  return fallback;
};
