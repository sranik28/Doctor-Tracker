'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { toApiDateRange } from '@/lib/dates';
import { doctorKeys } from '@/lib/query-keys';
import type { CreateDoctorValues, DoctorListFilters } from '@/schemas/doctor.schema';
import type { ApiPaginatedResponse, ApiSuccessResponse, PaginatedResult } from '@/types/api';
import type { Doctor, DoctorFilterOptions, DoctorListItem } from '@/types/doctor';

const toApiParams = ({ from, to, ...rest }: DoctorListFilters) => ({
  ...rest,
  ...toApiDateRange(from, to),
});

const fetchDoctors = async (
  filters: DoctorListFilters,
  signal: AbortSignal,
): Promise<PaginatedResult<DoctorListItem>> => {
  const { data } = await api.get<ApiPaginatedResponse<DoctorListItem>>('/doctors', {
    params: toApiParams(filters),
    signal,
  });
  return { items: data.data, meta: data.meta };
};

export const useDoctors = (filters: DoctorListFilters) =>
  useQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: ({ signal }) => fetchDoctors(filters, signal),
    // Keep the current rows on screen while the next page/filter loads: no flicker.
    placeholderData: keepPreviousData,
  });

export const useDoctorFilterOptions = () =>
  useQuery({
    queryKey: doctorKeys.filterOptions(),
    queryFn: async () => {
      const { data } = await api.get<ApiSuccessResponse<DoctorFilterOptions>>(
        '/doctors/filters/options',
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

/** id + name of doctors for dropdowns (patients filter, reassign). First 50 by name. */
export const useDoctorOptions = () =>
  useQuery({
    queryKey: doctorKeys.options(),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiPaginatedResponse<DoctorListItem>>('/doctors', {
        params: { limit: 50, sort: 'name' },
        signal,
      });
      return data.data.map(({ _id, name, specialization }) => ({ _id, name, specialization }));
    },
    staleTime: 5 * 60 * 1000,
  });

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateDoctorValues): Promise<Doctor> => {
      const { data } = await api.post<ApiSuccessResponse<Doctor>>('/doctors', values);
      return data.data;
    },
    // Lists and filter options (a new specialization/hospital) both change.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.all }),
  });
};
