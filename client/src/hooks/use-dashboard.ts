'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

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

export const useDashboardStats = () =>
  useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => getData<DashboardStats>('stats'),
    staleTime: DASHBOARD_STALE_TIME,
  });

export const usePatientsOverTime = (range: TimelineRange) =>
  useQuery({
    queryKey: dashboardKeys.timeline(range),
    queryFn: () => getData<TimelinePoint[]>('timeline', { range }),
    staleTime: DASHBOARD_STALE_TIME,
    // Keep the previous range on screen while the next one loads: no flash on toggle.
    placeholderData: keepPreviousData,
  });

export const usePatientsPerDoctor = (limit = 10) =>
  useQuery({
    queryKey: dashboardKeys.patientsPerDoctor(limit),
    queryFn: () => getData<DoctorPatientCount[]>('patients-per-doctor', { limit }),
    staleTime: DASHBOARD_STALE_TIME,
  });

export const useConditionBreakdown = () =>
  useQuery({
    queryKey: dashboardKeys.conditions(),
    queryFn: () => getData<ConditionCount[]>('conditions'),
    staleTime: DASHBOARD_STALE_TIME,
  });

export const useSpecializationBreakdown = () =>
  useQuery({
    queryKey: dashboardKeys.specializations(),
    queryFn: () => getData<SpecializationCount[]>('specializations'),
    staleTime: DASHBOARD_STALE_TIME,
  });

export const useRecentPatients = (limit = 5) =>
  useQuery({
    queryKey: dashboardKeys.recentPatients(limit),
    queryFn: () => getData<Patient[]>('recent-patients', { limit }),
    staleTime: DASHBOARD_STALE_TIME,
  });
