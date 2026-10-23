import type { Types } from 'mongoose';

import { DoctorModel } from '../models/doctor.model.js';
import { PatientModel } from '../models/patient.model.js';
import {
  DASHBOARD_TIMEZONE,
  dhakaDayKey,
  lastDhakaDayKeys,
  lastDhakaMonthKeys,
  startOfDhakaDay,
  startOfDhakaMonth,
} from '../utils/dhaka-time.js';
import { TtlCache } from '../utils/ttl-cache.js';
import type {
  PatientsPerDoctorQuery,
  RecentPatientsQuery,
  TimelineQuery,
  TimelineRange,
} from '../validations/dashboard.validation.js';
import { type PatientWithDoctor, listRecentPatients } from './patient.service.js';

// 60s TTL, no invalidation: see TtlCache for the staleness tradeoff.
const cache = new TtlCache(60_000);

const TOP_CONDITIONS = 6;
const OTHER_LABEL = 'Other';
const DAY_MS = 24 * 60 * 60 * 1000;

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
  const thisMonthStart = startOfDhakaMonth(now);
  const lastMonthStart = startOfDhakaMonth(now, 1);

  // One $facet = one pass for all three patient counts. The month facets use the
  // admittedAt index; the total is a metadata count, not a scan.
  const [[facets], totalDoctors, totalPatients] = await Promise.all([
    PatientModel.aggregate<{
      thisMonth: { n: number }[];
      lastMonth: { n: number }[];
    }>([
      { $match: { admittedAt: { $gte: lastMonthStart } } },
      {
        $facet: {
          thisMonth: [{ $match: { admittedAt: { $gte: thisMonthStart } } }, { $count: 'n' }],
          lastMonth: [
            { $match: { admittedAt: { $gte: lastMonthStart, $lt: thisMonthStart } } },
            { $count: 'n' },
          ],
        },
      },
    ]),
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

const loadPatientsPerDoctor = (limit: number): Promise<DoctorPatientCount[]> =>
  PatientModel.aggregate<DoctorPatientCount>(
    [
      // Group first, look up names only for the top N. With no $match the planner would pick
      // a collection scan, so the hint makes it an index-only scan on doctorId instead.
      { $group: { _id: '$doctorId', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: limit },
      {
        $lookup: {
          from: DoctorModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          pipeline: [{ $project: { name: 1, specialization: 1 } }],
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $project: {
          _id: 0,
          doctorId: '$_id',
          name: '$doctor.name',
          specialization: '$doctor.specialization',
          count: 1,
        },
      },
    ],
    { hint: { doctorId: 1, admittedAt: -1 } },
  );

export const getPatientsPerDoctor = ({ limit }: PatientsPerDoctorQuery) =>
  cache.getOrSet(`patients-per-doctor:${limit}`, () => loadPatientsPerDoctor(limit));

// ---- Timeline ----

export interface TimelinePoint {
  date: string;
  count: number;
}

interface TimelineConfig {
  /** $dateToString format, also the shape of the bucket keys. */
  format: string;
  keys: (now: Date) => string[];
  start: (now: Date) => Date;
}

const TIMELINE_CONFIG: Record<TimelineRange, TimelineConfig> = {
  '7d': {
    format: '%Y-%m-%d',
    keys: (now) => lastDhakaDayKeys(7, now),
    start: (now) => new Date(startOfDhakaDay(now).getTime() - 6 * DAY_MS),
  },
  '30d': {
    format: '%Y-%m-%d',
    keys: (now) => lastDhakaDayKeys(30, now),
    start: (now) => new Date(startOfDhakaDay(now).getTime() - 29 * DAY_MS),
  },
  '12m': {
    format: '%Y-%m',
    keys: (now) => lastDhakaMonthKeys(12, now),
    start: (now) => startOfDhakaMonth(now, 11),
  },
};

export const loadTimeline = async (range: TimelineRange, now: Date): Promise<TimelinePoint[]> => {
  const { format, keys, start } = TIMELINE_CONFIG[range];

  const rows = await PatientModel.aggregate<{ _id: string; count: number }>([
    // $match first: a range scan on the admittedAt index.
    { $match: { admittedAt: { $gte: start(now), $lte: now } } },
    {
      $group: {
        _id: { $dateToString: { format, date: '$admittedAt', timezone: DASHBOARD_TIMEZONE } },
        count: { $sum: 1 },
      },
    },
  ]);

  // Days/months with no admissions don't come back from $group: fill them with 0.
  const counts = new Map(rows.map(({ _id, count }) => [_id, count]));
  return keys(now).map((date) => ({ date, count: counts.get(date) ?? 0 }));
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
  // Hinted so the grouping reads the condition index instead of every patient document.
  const rows = await PatientModel.aggregate<ConditionCount>(
    [
      { $group: { _id: '$condition', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $project: { _id: 0, condition: '$_id', count: 1 } },
    ],
    { hint: { condition: 1, admittedAt: -1 } },
  );

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

const loadSpecializations = (): Promise<SpecializationCount[]> =>
  DoctorModel.aggregate<SpecializationCount>(
    [
      { $group: { _id: '$specialization', doctorCount: { $sum: 1 } } },
      { $sort: { doctorCount: -1, _id: 1 } },
      { $project: { _id: 0, specialization: '$_id', doctorCount: 1 } },
    ],
    { hint: { specialization: 1, createdAt: -1 } },
  );

export const getSpecializationBreakdown = () =>
  cache.getOrSet('specializations', loadSpecializations);

// ---- Recent patients ----

export const getRecentPatients = ({ limit }: RecentPatientsQuery): Promise<PatientWithDoctor[]> =>
  cache.getOrSet(`recent-patients:${limit}`, () => listRecentPatients(limit));
