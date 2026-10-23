import type { Types } from 'mongoose';

import { DoctorModel } from '../models/doctor.model.js';
import { PatientModel } from '../models/patient.model.js';
import { dhakaDayKey, lastDhakaDayKeys, lastDhakaMonthKeys } from '../utils/dhaka-time.js';
import { TtlCache } from '../utils/ttl-cache.js';
import type {
  PatientsPerDoctorQuery,
  RecentPatientsQuery,
  TimelineQuery,
  TimelineRange,
} from '../validations/dashboard.validation.js';
import {
  buildConditionsPipeline,
  buildPatientsPerDoctorPipeline,
  buildSpecializationsPipeline,
  buildStatsPipeline,
  buildTimelinePipeline,
} from './dashboard.queries.js';
import { type PatientWithDoctor, listRecentPatients } from './patient.service.js';

// 60s TTL, no invalidation: see TtlCache for the staleness tradeoff.
const cache = new TtlCache(60_000);

const TOP_CONDITIONS = 6;
const OTHER_LABEL = 'Other';

// ---- Stats ----

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  patientsThisMonth: number;
  patientsLastMonth: number;
  /** Month-over-month change in %, or null when last month had no patients to compare to. */
  growthPercent: number | null;
}

/** Percent change; 0→0 is 0 and 0→N is "n/a" (null) instead of NaN/Infinity. */
export const calculateGrowthPercent = (current: number, previous: number): number | null => {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const loadStats = async (now: Date): Promise<DashboardStats> => {
  const { pipeline } = buildStatsPipeline(now);
  const [[facets], totalDoctors, totalPatients] = await Promise.all([
    PatientModel.aggregate<{
      thisMonth: { n: number }[];
      lastMonth: { n: number }[];
    }>(pipeline),
    DoctorModel.estimatedDocumentCount(),
    PatientModel.estimatedDocumentCount(),
  ]);

  const patientsThisMonth = facets?.thisMonth[0]?.n ?? 0;
  const patientsLastMonth = facets?.lastMonth[0]?.n ?? 0;

  return {
    totalDoctors,
    totalPatients,
    patientsThisMonth,
    patientsLastMonth,
    growthPercent: calculateGrowthPercent(patientsThisMonth, patientsLastMonth),
  };
};

export const getDashboardStats = (now = new Date()): Promise<DashboardStats> =>
  cache.getOrSet('stats', () => loadStats(now));

// ---- Patients per doctor ----

export interface DoctorPatientCount {
  doctorId: Types.ObjectId;
  name: string;
  specialization: string;
  count: number;
}

const loadPatientsPerDoctor = (limit: number): Promise<DoctorPatientCount[]> => {
  const { pipeline, hint } = buildPatientsPerDoctorPipeline(limit);
  return PatientModel.aggregate<DoctorPatientCount>(pipeline, hint ? { hint } : {});
};

export const getPatientsPerDoctor = ({ limit }: PatientsPerDoctorQuery) =>
  cache.getOrSet(`patients-per-doctor:${limit}`, () => loadPatientsPerDoctor(limit));

// ---- Timeline ----

export interface TimelinePoint {
  date: string;
  count: number;
}

const TIMELINE_KEYS: Record<TimelineRange, (now: Date) => string[]> = {
  '7d': (now) => lastDhakaDayKeys(7, now),
  '30d': (now) => lastDhakaDayKeys(30, now),
  '12m': (now) => lastDhakaMonthKeys(12, now),
};

export const loadTimeline = async (range: TimelineRange, now: Date): Promise<TimelinePoint[]> => {
  const rows = await PatientModel.aggregate<{ _id: string; count: number }>(
    buildTimelinePipeline(range, now).pipeline,
  );

  // Days/months with no admissions don't come back from $group: fill them with 0.
  const counts = new Map(rows.map(({ _id, count }) => [_id, count]));
  return TIMELINE_KEYS[range](now).map((date) => ({ date, count: counts.get(date) ?? 0 }));
};

export const getTimeline = ({ range }: TimelineQuery, now = new Date()) =>
  // Keyed by the Dhaka day too, so a cached timeline never outlives midnight.
  cache.getOrSet(`timeline:${range}:${dhakaDayKey(now)}`, () => loadTimeline(range, now));

// ---- Conditions ----

export interface ConditionCount {
  condition: string;
  count: number;
}

const loadConditions = async (): Promise<ConditionCount[]> => {
  const { pipeline, hint } = buildConditionsPipeline();
  const rows = await PatientModel.aggregate<ConditionCount>(pipeline, hint ? { hint } : {});

  const top = rows.slice(0, TOP_CONDITIONS);
  const otherCount = rows.slice(TOP_CONDITIONS).reduce((sum, row) => sum + row.count, 0);
  return otherCount > 0 ? [...top, { condition: OTHER_LABEL, count: otherCount }] : top;
};

export const getConditionBreakdown = () => cache.getOrSet('conditions', loadConditions);

// ---- Specializations ----

export interface SpecializationCount {
  specialization: string;
  doctorCount: number;
}

const loadSpecializations = (): Promise<SpecializationCount[]> => {
  const { pipeline, hint } = buildSpecializationsPipeline();
  return DoctorModel.aggregate<SpecializationCount>(pipeline, hint ? { hint } : {});
};

export const getSpecializationBreakdown = () =>
  cache.getOrSet('specializations', loadSpecializations);

// ---- Recent patients ----

export const getRecentPatients = ({ limit }: RecentPatientsQuery): Promise<PatientWithDoctor[]> =>
  cache.getOrSet(`recent-patients:${limit}`, () => listRecentPatients(limit));
