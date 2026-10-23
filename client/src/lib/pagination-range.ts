export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index);

/**
 * Page numbers to render, e.g. current 6 of 12 -> [1, '…', 5, 6, 7, '…', 12].
 * Always shows first and last, `siblings` pages either side of the current one.
 */
export const getPaginationRange = (
  currentPage: number,
  totalPages: number,
  siblings = 1,
): PaginationItem[] => {
  // first + last + current + siblings on both sides + two ellipses
  const maxItems = siblings * 2 + 5;
  if (totalPages <= maxItems) return range(1, totalPages);

  const left = Math.max(currentPage - siblings, 1);
  const right = Math.min(currentPage + siblings, totalPages);
  const showStartEllipsis = left > 3;
  const showEndEllipsis = right < totalPages - 2;
  const edgeCount = 3 + siblings * 2;

  if (!showStartEllipsis) return [...range(1, edgeCount), 'ellipsis-end', totalPages];
  if (!showEndEllipsis) {
    return [1, 'ellipsis-start', ...range(totalPages - edgeCount + 1, totalPages)];
  }
  return [1, 'ellipsis-start', ...range(left, right), 'ellipsis-end', totalPages];
};
