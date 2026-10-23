export const DEFAULT_AUTHENTICATED_PATH = '/dashboard';

/**
 * Accepts only same-origin relative paths ("/doctors?page=2").
 * Rejects absolute and protocol-relative URLs ("https://…", "//evil.com", "/\\evil.com")
 * so ?next= can't be used as an open redirect.
 */
export const getSafeRedirectPath = (next: string | null | undefined): string => {
  if (!next?.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  return next;
};
