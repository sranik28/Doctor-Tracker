import { validated } from '../middlewares/validate.js';
import * as doctorService from '../services/doctor.service.js';
import * as publicDoctorService from '../services/public-doctor.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listPublicDoctorsQuerySchema,
  publicDoctorIdParamsSchema,
} from '../validations/public-doctor.validation.js';

export const listPublicDoctors = asyncHandler(async (req, res) => {
  const query = validated(listPublicDoctorsQuerySchema, req.query);
  const { doctors, meta } = await publicDoctorService.listPublicDoctors(query);
  sendSuccess(res, doctors, 200, meta);
});

export const getPublicDoctorFilterOptions = asyncHandler(async (_req, res) => {
  sendSuccess(res, await doctorService.getDoctorFilterOptions());
});

export const getPublicDoctor = asyncHandler(async (req, res) => {
  const { id } = validated(publicDoctorIdParamsSchema, req.params);
  sendSuccess(res, await publicDoctorService.getPublicDoctorById(id));
});
