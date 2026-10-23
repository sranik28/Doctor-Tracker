import type { PipelineStage } from 'mongoose';

import { DoctorModel } from '../models/doctor.model.js';
import { DASHBOARD_TIMEZONE, startOfDhakaDay, startOfDhakaMonth } from '../utils/dhaka-time.js';
import type { TimelineRange } from '../validations/dashboard.validation.js';

/**
 * The dashboard's aggregation pipelines, kept apart from caching and shaping so the explain
 * report (scripts/explain-report.ts) measures exactly the queries the API runs.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export interface PipelineQuery {
  pipeline: PipelineStage[];
  /** Forces the covering index; without a $match the planner would otherwise scan the collection. */
  hint?: Record<string, 1 | -1>;
}

/** One $facet = one pass for both month counts; both facets use the admittedAt index. */
export const buildStatsPipeline = (now: Date): PipelineQuery => {
  const thisMonthStart = startOfDhakaMonth(now);
  const lastMonthStart = startOfDhakaMonth(now, 1);

  return {
    pipeline: [
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
    ],
  };
};

/** Group first, look up names only for the top N. */
export const buildPatientsPerDoctorPipeline = (limit: number): PipelineQuery => ({
  pipeline: [
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
  hint: { doctorId: 1, admittedAt: -1 },
});

export const TIMELINE_FORMAT: Record<TimelineRange, string> = {
  '7d': '%Y-%m-%d',
  '30d': '%Y-%m-%d',
  '12m': '%Y-%m',
};

export const timelineStart = (range: TimelineRange, now: Date): Date => {
  if (range === '12m') return startOfDhakaMonth(now, 11);
  const days = range === '7d' ? 7 : 30;
  return new Date(startOfDhakaDay(now).getTime() - (days - 1) * DAY_MS);
};

/** $match first: a covered range scan on the admittedAt index. */
export const buildTimelinePipeline = (range: TimelineRange, now: Date): PipelineQuery => ({
  pipeline: [
    { $match: { admittedAt: { $gte: timelineStart(range, now), $lte: now } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: TIMELINE_FORMAT[range],
            date: '$admittedAt',
            timezone: DASHBOARD_TIMEZONE,
          },
        },
        count: { $sum: 1 },
      },
    },
  ],
});

export const buildConditionsPipeline = (): PipelineQuery => ({
  pipeline: [
    { $group: { _id: '$condition', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $project: { _id: 0, condition: '$_id', count: 1 } },
  ],
  hint: { condition: 1, admittedAt: -1 },
});

export const buildSpecializationsPipeline = (): PipelineQuery => ({
  pipeline: [
    { $group: { _id: '$specialization', doctorCount: { $sum: 1 } } },
    { $sort: { doctorCount: -1, _id: 1 } },
    { $project: { _id: 0, specialization: '$_id', doctorCount: 1 } },
  ],
  hint: { specialization: 1, createdAt: -1 },
});
