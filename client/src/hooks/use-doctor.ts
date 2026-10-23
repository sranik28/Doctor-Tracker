'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { api } from '@/lib/api';
import { getApiErrorStatus } from '@/lib/api-error';
import { doctorKeys } from '@/lib/query-keys';
import type { AddPatientValues, PatientListFilters } from '@/schemas/patient.schema';
import type { ApiPaginatedResponse, ApiSuccessResponse, PaginatedResult } from '@/types/api';
import type { DoctorDetail } from '@/types/doctor';
import type { Patient } from '@/types/patient';

/** 4xx (bad id, not found) won't change on retry; only retry network/server errors, once. */
const retryUnlessClientError = (failureCount: number, error: unknown) => {
  const status = getApiErrorStatus(error);
  return !(status && status >= 400 && status < 500) && failureCount < 1;
};

export const useDoctor = (doctorId: string, enabled: boolean) =>
  useQuery({
    queryKey: doctorKeys.detail(doctorId),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiSuccessResponse<DoctorDetail>>(`/doctors/${doctorId}`, {
        signal,
      });
      return data.data;
    },
    enabled,
    retry: retryUnlessClientError,
  });

export const useDoctorPatients = (
  doctorId: string,
  filters: PatientListFilters,
  enabled: boolean,
) =>
  useQuery({
    queryKey: doctorKeys.patientList(doctorId, filters),
    queryFn: async ({ signal }): Promise<PaginatedResult<Patient>> => {
      const { data } = await api.get<ApiPaginatedResponse<Patient>>(
        `/doctors/${doctorId}/patients`,
        { params: filters, signal },
      );
      return { items: data.data, meta: data.meta };
    },
    enabled,
    retry: retryUnlessClientError,
    placeholderData: keepPreviousData,
  });

/** Refresh this doctor (count + patients, via the key prefix) and every doctors list. */
const invalidateDoctorData = (queryClient: ReturnType<typeof useQueryClient>, doctorId: string) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: doctorKeys.detail(doctorId) }),
    queryClient.invalidateQueries({ queryKey: doctorKeys.lists() }),
  ]);

export const useAddPatient = (doctorId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ admittedAt, notes, ...values }: AddPatientValues): Promise<Patient> => {
      const { data } = await api.post<ApiSuccessResponse<Patient>>(
        `/doctors/${doctorId}/patients`,
        {
          ...values,
          // Local noon: the chosen calendar day survives any UTC offset.
          admittedAt: new Date(`${format(admittedAt, 'yyyy-MM-dd')}T12:00:00`).toISOString(),
          ...(notes && { notes }),
        },
      );
      return data.data;
    },
    onSuccess: () => invalidateDoctorData(queryClient, doctorId),
  });
};

interface DeleteContext {
  previousLists: [readonly unknown[], PaginatedResult<Patient> | undefined][];
  previousDoctor: DoctorDetail | undefined;
}

/** Optimistic: the row and the doctor's count update at once, and roll back on failure. */
export const useDeletePatient = (doctorId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, Patient, DeleteContext>({
    mutationFn: async (patient) => {
      await api.delete(`/doctors/${doctorId}/patients/${patient._id}`);
    },
    onMutate: async (patient) => {
      await queryClient.cancelQueries({ queryKey: doctorKeys.detail(doctorId) });

      const previousLists = queryClient.getQueriesData<PaginatedResult<Patient>>({
        queryKey: doctorKeys.patients(doctorId),
      });
      const previousDoctor = queryClient.getQueryData<DoctorDetail>(doctorKeys.detail(doctorId));

      queryClient.setQueriesData<PaginatedResult<Patient>>(
        { queryKey: doctorKeys.patients(doctorId) },
        (page) => {
          if (!page?.items.some((item) => item._id === patient._id)) return page;
          const total = Math.max(0, page.meta.total - 1);
          return {
            items: page.items.filter((item) => item._id !== patient._id),
            meta: { ...page.meta, total, totalPages: Math.ceil(total / page.meta.limit) },
          };
        },
      );
      queryClient.setQueryData<DoctorDetail>(doctorKeys.detail(doctorId), (doctor) =>
        doctor ? { ...doctor, patientCount: Math.max(0, doctor.patientCount - 1) } : doctor,
      );

      return { previousLists, previousDoctor };
    },
    onError: (_error, _patient, context) => {
      context?.previousLists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.previousDoctor) {
        queryClient.setQueryData(doctorKeys.detail(doctorId), context.previousDoctor);
      }
    },
    onSettled: () => invalidateDoctorData(queryClient, doctorId),
  });
};
