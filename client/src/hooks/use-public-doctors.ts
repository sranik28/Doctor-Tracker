'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { getApiErrorStatus } from '@/lib/api-error';
import { publicDoctorKeys } from '@/lib/query-keys';
import { PUBLIC_PAGE_SIZE, type PublicDoctorFilters } from '@/schemas/public-doctor.schema';
import type { ApiPaginatedResponse, ApiSuccessResponse, PaginatedResult } from '@/types/api';
import type { DoctorFilterOptions } from '@/types/doctor';
import type { PublicDoctor } from '@/types/public-doctor';

const FIVE_MINUTES = 5 * 60 * 1000;

export const usePublicDoctors = (filters: PublicDoctorFilters) =>
  useQuery({
    queryKey: publicDoctorKeys.list(filters),
    queryFn: async ({ signal }): Promise<PaginatedResult<PublicDoctor>> => {
      const { data } = await api.get<ApiPaginatedResponse<PublicDoctor>>('/public/doctors', {
        params: { ...filters, limit: PUBLIC_PAGE_SIZE },
        signal,
      });
      return { items: data.data, meta: data.meta };
    },
    placeholderData: keepPreviousData,
  });

export const usePublicFilterOptions = () =>
  useQuery({
    queryKey: publicDoctorKeys.filterOptions(),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiSuccessResponse<DoctorFilterOptions>>(
        '/public/doctors/filters/options',
        { signal },
      );
      return data.data;
    },
    staleTime: FIVE_MINUTES,
  });

export const usePublicDoctor = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: publicDoctorKeys.detail(id),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiSuccessResponse<PublicDoctor>>(`/public/doctors/${id}`, {
        signal,
      });
      return data.data;
    },
    enabled,
    // A missing doctor won't appear on retry.
    retry: (failureCount, error) => failureCount < 1 && getApiErrorStatus(error) !== 404,
  });
