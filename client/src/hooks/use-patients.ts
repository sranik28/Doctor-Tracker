'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSelectedHospital } from '@/hooks/use-selected-hospital';
import { api } from '@/lib/api';
import { getApiErrorStatus } from '@/lib/api-error';
import { toApiDateRange, toLocalNoonIso } from '@/lib/dates';
import {
  type PaginatedSnapshot,
  removeFromPaginatedCache,
  replaceInPaginatedCache,
  restorePaginatedCache,
} from '@/lib/paginated-cache';
import { doctorKeys, patientKeys } from '@/lib/query-keys';
import type { EditPatientValues, PatientsPageFilters } from '@/schemas/patient.schema';
import type { ApiPaginatedResponse, ApiSuccessResponse, PaginatedResult } from '@/types/api';
import type { Patient } from '@/types/patient';

export const usePatients = (filters: PatientsPageFilters) => {
  const { hospital } = useSelectedHospital();
  return useQuery({
    queryKey: patientKeys.list(filters, hospital),
    queryFn: async ({ signal }): Promise<PaginatedResult<Patient>> => {
      const { from, to, ...rest } = filters;
      const { data } = await api.get<ApiPaginatedResponse<Patient>>('/patients', {
        params: { ...rest, hospital, ...toApiDateRange(from, to) },
        signal,
      });
      return { items: data.data, meta: data.meta };
    },
    // Keep the current rows on screen while the next page/filter loads: no flicker.
    placeholderData: keepPreviousData,
  });
};

/** One patient with their doctor, for the profile page. */
export const usePatient = (patientId: string, enabled: boolean) =>
  useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiSuccessResponse<Patient>>(`/patients/${patientId}`, {
        signal,
      });
      return data.data;
    },
    enabled,
    // A missing patient (404) or bad id (400) won't change on retry.
    retry: (failureCount, error) => {
      const status = getApiErrorStatus(error);
      return !(status && status >= 400 && status < 500) && failureCount < 1;
    },
  });

export const usePatientFilterOptions = () =>
  useQuery({
    queryKey: patientKeys.filterOptions(),
    queryFn: async () => {
      const { data } = await api.get<ApiSuccessResponse<{ conditions: string[] }>>(
        '/patients/filters/options',
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

/**
 * A patient change can move counts between doctors and change the condition options, so
 * refresh every patients list, every doctors list (patientCount) and every cached doctor
 * detail (its count and its patients list).
 */
const invalidateAfterPatientChange = (queryClient: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: patientKeys.all }),
    queryClient.invalidateQueries({ queryKey: doctorKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: doctorKeys.details() }),
  ]);

export type PatientChanges = Partial<EditPatientValues>;

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      changes: { admittedAt, ...changes },
    }: {
      patientId: string;
      changes: PatientChanges;
    }): Promise<Patient> => {
      const { data } = await api.patch<ApiSuccessResponse<Patient>>(`/patients/${patientId}`, {
        ...changes,
        ...(admittedAt && { admittedAt: toLocalNoonIso(admittedAt) }),
      });
      return data.data;
    },
    onSuccess: (patient) => {
      // Show the saved row right away; the refetch then re-applies sort and filters.
      replaceInPaginatedCache(queryClient, patientKeys.lists(), patient);
      queryClient.setQueryData(patientKeys.detail(patient._id), patient);
      return invalidateAfterPatientChange(queryClient);
    },
  });
};

/** Optimistic: the row disappears at once and comes back if the request fails. */
export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, Patient, PaginatedSnapshot<Patient>>({
    mutationFn: async (patient) => {
      await api.delete(`/patients/${patient._id}`);
    },
    onMutate: async (patient) => {
      await queryClient.cancelQueries({ queryKey: patientKeys.lists() });
      return removeFromPaginatedCache<Patient>(queryClient, patientKeys.lists(), patient._id);
    },
    onError: (_error, _patient, snapshot) => restorePaginatedCache(queryClient, snapshot),
    onSettled: () => invalidateAfterPatientChange(queryClient),
  });
};
