import { validated } from '../middlewares/validate.js';
import * as dashboardService from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  patientsPerDoctorQuerySchema,
  recentPatientsQuerySchema,
  timelineQuerySchema,
} from '../validations/dashboard.validation.js';

export const getStats = asyncHandler(async (_req, res) => {
  sendSuccess(res, await dashboardService.getDashboardStats());
});

export const getPatientsPerDoctor = asyncHandler(async (req, res) => {
  const query = validated(patientsPerDoctorQuerySchema, req.query);
  sendSuccess(res, await dashboardService.getPatientsPerDoctor(query));
});

export const getTimeline = asyncHandler(async (req, res) => {
  const query = validated(timelineQuerySchema, req.query);
  sendSuccess(res, await dashboardService.getTimeline(query));
});

export const getConditions = asyncHandler(async (_req, res) => {
  sendSuccess(res, await dashboardService.getConditionBreakdown());
});

export const getSpecializations = asyncHandler(async (_req, res) => {
  sendSuccess(res, await dashboardService.getSpecializationBreakdown());
});

export const getRecentPatients = asyncHandler(async (req, res) => {
  const query = validated(recentPatientsQuerySchema, req.query);
  sendSuccess(res, await dashboardService.getRecentPatients(query));
});
