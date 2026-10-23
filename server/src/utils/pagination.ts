import type { PaginationMeta } from './apiResponse.js';

export interface PaginationParams {
  page: number;
  limit: number;
}

export const getSkip = ({ page, limit }: PaginationParams): number => (page - 1) * limit;

export const buildPaginationMeta = (
  { page, limit }: PaginationParams,
  total: number,
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
