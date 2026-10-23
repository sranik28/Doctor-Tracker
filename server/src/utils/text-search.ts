/**
 * Turns user input into a plain $text search string. Quotes would start a phrase and a
 * leading "-" would exclude a term, so both are stripped. Returns undefined if nothing is left.
 */
export const toTextSearch = (input: string | undefined): string | undefined => {
  if (!input) return undefined;

  const terms = input
    .replace(/["\\]/g, ' ')
    .split(/\s+/)
    .map((term) => term.replace(/^-+/, ''))
    .filter(Boolean);

  return terms.length > 0 ? terms.join(' ') : undefined;
};
