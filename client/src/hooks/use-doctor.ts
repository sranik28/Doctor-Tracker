'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { getApiErrorStatus } from '@/lib/api-error';
import { toLocalNoonIso } from '@/lib/dates';
import {
  type PaginatedSnapshot,
  removeFromPaginatedCache,
  restorePaginatedCache,
} from '@/lib/paginated-cache';
import { doctorKeys, patientKeys } from '@/lib/query-keys';
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

/** Refresh this doctor (count + patients, via the key prefix), doctors lists and patients lists. */
const invalidateDoctorData = (queryClient: ReturnType<typeof useQueryClient>, doctorId: string) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: doctorKeys.detail(doctorId) }),
    queryClient.invalidateQueries({ queryKey: doctorKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: patientKeys.all }),
  ]);

export const useAddPatient = (doctorId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ admittedAt, notes, ...values }: AddPatientValues): Promise<Patient> => {
      const { data } = await api.post<ApiSuccessResponse<Patient>>(
        `/doctors/${doctorId}/patients`,
        {
          ...values,
          admittedAt: toLocalNoonIso(admittedAt),
          ...(notes && { notes }),
        },
      );
      return data.data;
    },
    onSuccess: () => invalidateDoctorData(queryClient, doctorId),
  });
};

interface DeleteContext {
  previousLists: PaginatedSnapshot<Patient>;
  previousDoctor: DoctorDetail | undefined;
}

/** Optimistic: the row and the doctor's count update at once, and roll back on failure. */
export const useDeleteDoctorPatient = (doctorId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, Patient, DeleteContext>({
    mutationFn: async (patient) => {
      await api.delete(`/doctors/${doctorId}/patients/${patient._id}`);
    },
    onMutate: async (patient) => {
      await queryClient.cancelQueries({ queryKey: doctorKeys.detail(doctorId) });

      const previousDoctor = queryClient.getQueryData<DoctorDetail>(doctorKeys.detail(doctorId));
      const previousLists = removeFromPaginatedCache<Patient>(
        queryClient,
        doctorKeys.patients(doctorId),
        patient._id,
      );
      queryClient.setQueryData<DoctorDetail>(doctorKeys.detail(doctorId), (doctor) =>
        doctor ? { ...doctor, patientCount: Math.max(0, doctor.patientCount - 1) } : doctor,
      );

      return { previousLists, previousDoctor };
    },
    onError: (_error, _patient, context) => {
      restorePaginatedCache(queryClient, context?.previousLists);
      if (context?.previousDoctor) {
        queryClient.setQueryData(doctorKeys.detail(doctorId), context.previousDoctor);
      }
    },
    onSettled: () => invalidateDoctorData(queryClient, doctorId),
  });
};
