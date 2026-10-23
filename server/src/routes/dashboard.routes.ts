import { Router } from 'express';

import {
  getConditions,
  getPatientsPerDoctor,
  getRecentPatients,
  getSpecializations,
  getStats,
  getTimeline,
} from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  patientsPerDoctorQuerySchema,
  scopeQuerySchema,
  recentPatientsQuerySchema,
  timelineQuerySchema,
} from '../validations/dashboard.validation.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate, authorize('admin'));

dashboardRouter.get('/stats', validate({ query: scopeQuerySchema }), getStats);
dashboardRouter.get(
  '/patients-per-doctor',
  validate({ query: patientsPerDoctorQuerySchema }),
  getPatientsPerDoctor,
);
dashboardRouter.get('/timeline', validate({ query: timelineQuerySchema }), getTimeline);
dashboardRouter.get('/conditions', validate({ query: scopeQuerySchema }), getConditions);
dashboardRouter.get('/specializations', validate({ query: scopeQuerySchema }), getSpecializations);
dashboardRouter.get(
  '/recent-patients',
  validate({ query: recentPatientsQuerySchema }),
  getRecentPatients,
);
