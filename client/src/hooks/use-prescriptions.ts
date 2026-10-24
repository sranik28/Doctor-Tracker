'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { getApiErrorStatus } from '@/lib/api-error';
import { toLocalNoonIso } from '@/lib/dates';
import { prescriptionKeys } from '@/lib/query-keys';
import type { PrescriptionValues } from '@/schemas/prescription.schema';
import type { ApiSuccessResponse } from '@/types/api';
import type { Prescription } from '@/types/prescription';

export const usePrescriptions = (patientId: string, enabled: boolean) =>
  useQuery({
    queryKey: prescriptionKeys.list(patientId),
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiSuccessResponse<Prescription[]>>(
        `/patients/${patientId}/prescriptions`,
        { signal },
      );
      return data.data;
    },
    enabled,
    retry: (failureCount, error) => {
      const status = getApiErrorStatus(error);
      return !(status && status >= 400 && status < 500) && failureCount < 1;
    },
  });

const toBody = ({ prescribedAt, instructions, ...rest }: PrescriptionValues) => ({
  ...rest,
  instructions,
  prescribedAt: toLocalNoonIso(prescribedAt),
});

export const useCreatePrescription = (patientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: PrescriptionValues): Promise<Prescription> => {
      const { data } = await api.post<ApiSuccessResponse<Prescription>>(
        `/patients/${patientId}/prescriptions`,
        toBody(values),
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: prescriptionKeys.list(patientId) }),
  });
};

export const useUpdatePrescription = (patientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      prescriptionId,
      values,
    }: {
      prescriptionId: string;
      values: PrescriptionValues;
    }): Promise<Prescription> => {
      const { data } = await api.patch<ApiSuccessResponse<Prescription>>(
        `/prescriptions/${prescriptionId}`,
        toBody(values),
      );
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: prescriptionKeys.list(patientId) }),
  });
};

export const useDeletePrescription = (patientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prescriptionId: string): Promise<void> => {
      await api.delete(`/prescriptions/${prescriptionId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: prescriptionKeys.list(patientId) }),
  });
};
