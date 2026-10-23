import { validated } from '../middlewares/validate.js';
import * as patientService from '../services/patient.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listPatientsQuerySchema,
  patientIdParamsSchema,
  updatePatientSchema,
} from '../validations/patient.validation.js';

export const listPatients = asyncHandler(async (req, res) => {
  const { patients, meta } = await patientService.listPatients(
    validated(listPatientsQuerySchema, req.query),
  );
  sendSuccess(res, patients, 200, meta);
});

export const getPatientFilterOptions = asyncHandler(async (_req, res) => {
  sendSuccess(res, await patientService.getPatientFilterOptions());
});

export const getPatient = asyncHandler(async (req, res) => {
  const { id } = validated(patientIdParamsSchema, req.params);
  sendSuccess(res, await patientService.getPatientById(id));
});

export const updatePatient = asyncHandler(async (req, res) => {
  const { id } = validated(patientIdParamsSchema, req.params);
  sendSuccess(
    res,
    await patientService.updatePatient(id, validated(updatePatientSchema, req.body)),
  );
});

export const deletePatient = asyncHandler(async (req, res) => {
  const { id } = validated(patientIdParamsSchema, req.params);
  sendSuccess(res, await patientService.deletePatient(id));
});
