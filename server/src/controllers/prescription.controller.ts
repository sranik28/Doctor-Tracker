import { validated } from '../middlewares/validate.js';
import * as prescriptionService from '../services/prescription.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { patientIdParamsSchema } from '../validations/patient.validation.js';
import {
  createPrescriptionSchema,
  listPrescriptionsQuerySchema,
  prescriptionIdParamsSchema,
  updatePrescriptionSchema,
} from '../validations/prescription.validation.js';

export const listPatientPrescriptions = asyncHandler(async (req, res) => {
  const { id } = validated(patientIdParamsSchema, req.params);
  const query = validated(listPrescriptionsQuerySchema, req.query);
  sendSuccess(res, await prescriptionService.listPatientPrescriptions(id, query));
});

export const createPrescription = asyncHandler(async (req, res) => {
  const { id } = validated(patientIdParamsSchema, req.params);
  const input = validated(createPrescriptionSchema, req.body);
  sendSuccess(res, await prescriptionService.createPrescription(id, input), 201);
});

export const updatePrescription = asyncHandler(async (req, res) => {
  const { id } = validated(prescriptionIdParamsSchema, req.params);
  const input = validated(updatePrescriptionSchema, req.body);
  sendSuccess(res, await prescriptionService.updatePrescription(id, input));
});

export const deletePrescription = asyncHandler(async (req, res) => {
  const { id } = validated(prescriptionIdParamsSchema, req.params);
  sendSuccess(res, await prescriptionService.deletePrescription(id));
});
