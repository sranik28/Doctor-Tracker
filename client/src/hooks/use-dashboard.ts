'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useSelectedHospital } from '@/hooks/use-selected-hospital';
import { api } from '@/lib/api';
import { dashboardKeys } from '@/lib/query-keys';
import type { ApiSuccessResponse } from '@/types/api';
import type {
  ConditionCount,
  DashboardStats,
  DoctorPatientCount,
  SpecializationCount,
  TimelinePoint,
  TimelineRange,
} from '@/types/dashboard';
import type { Patient } from '@/types/patient';

// Matches the server's 60s cache: refetching sooner would just return the same numbers.
const DASHBOARD_STALE_TIME = 60 * 1000;

const getData = async <T>(path: string, params?: Record<string, unknown>): Promise<T> => {
  const { data } = await api.get<ApiSuccessResponse<T>>(`/dashboard/${path}`, { params });
  return data.data;
};

export const useDashboardStats = () => {
  const { hospital } = useSelectedHospital();
  return useQuery({
    queryKey: dashboardKeys.stats(hospital),
    queryFn: () => getData<DashboardStats>('stats', { hospital }),
    staleTime: DASHBOARD_STALE_TIME,
  });
};

export const usePatientsOverTime = (range: TimelineRange) => {
  const { hospital } = useSelectedHospital();
  return useQuery({
    queryKey: dashboardKeys.timeline(range, hospital),
    queryFn: () => getData<TimelinePoint[]>('timeline', { range, hospital }),
    staleTime: DASHBOARD_STALE_TIME,
    // Keep the previous range on screen while the next one loads: no flash on toggle.
    placeholderData: keepPreviousData,
  });
};

export const usePatientsPerDoctor = (limit = 10) => {
  const { hospital } = useSelectedHospital();
  return useQuery({
    queryKey: dashboardKeys.patientsPerDoctor(limit, hospital),
    queryFn: () => getData<DoctorPatientCount[]>('patients-per-doctor', { limit, hospital }),
    staleTime: DASHBOARD_STALE_TIME,
  });
};

export const useConditionBreakdown = () => {
  const { hospital } = useSelectedHospital();
  return useQuery({
    queryKey: dashboardKeys.conditions(hospital),
    queryFn: () => getData<ConditionCount[]>('conditions', { hospital }),
    staleTime: DASHBOARD_STALE_TIME,
  });
};

export const useSpecializationBreakdown = () => {
  const { hospital } = useSelectedHospital();
  return useQuery({
    queryKey: dashboardKeys.specializations(hospital),
    queryFn: () => getData<SpecializationCount[]>('specializations', { hospital }),
    staleTime: DASHBOARD_STALE_TIME,
  });
};

export const useRecentPatients = (limit = 5) => {
  const { hospital } = useSelectedHospital();
  return useQuery({
    queryKey: dashboardKeys.recentPatients(limit, hospital),
    queryFn: () => getData<Patient[]>('recent-patients', { limit, hospital }),
    staleTime: DASHBOARD_STALE_TIME,
  });
};
