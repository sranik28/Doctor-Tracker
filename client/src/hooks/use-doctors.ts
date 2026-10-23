'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endOfDay, parseISO, startOfDay } from 'date-fns';

import { api } from '@/lib/api';
import { doctorKeys } from '@/lib/query-keys';
import type { CreateDoctorValues, DoctorListFilters } from '@/schemas/doctor.schema';
import type { ApiPaginatedResponse, ApiSuccessResponse, PaginatedResult } from '@/types/api';
import type { Doctor, DoctorFilterOptions, DoctorListItem } from '@/types/doctor';

/** URL keeps plain dates; the API gets the user's local day boundaries as ISO datetimes. */
const toApiParams = ({ from, to, ...rest }: DoctorListFilters) => ({
  ...rest,
  from: from ? startOfDay(parseISO(from)).toISOString() : undefined,
  to: to ? endOfDay(parseISO(to)).toISOString() : undefined,
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
