import { validated } from '../middlewares/validate.js';
import * as doctorService from '../services/doctor.service.js';
import * as patientService from '../services/patient.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createDoctorSchema,
  doctorIdParamsSchema,
  listDoctorsQuerySchema,
} from '../validations/doctor.validation.js';
import {
  createPatientSchema,
  doctorPatientParamsSchema,
  listDoctorPatientsQuerySchema,
} from '../validations/patient.validation.js';

export const listDoctors = asyncHandler(async (req, res) => {
  const query = validated(listDoctorsQuerySchema, req.query);
  const { doctors, meta } = await doctorService.listDoctors(query);
  sendSuccess(res, doctors, 200, meta);
});

export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.createDoctor(validated(createDoctorSchema, req.body));
  sendSuccess(res, doctor, 201);
});

export const getDoctorFilterOptions = asyncHandler(async (_req, res) => {
  sendSuccess(res, await doctorService.getDoctorFilterOptions());
});

export const getDoctor = asyncHandler(async (req, res) => {
  const { id } = validated(doctorIdParamsSchema, req.params);
  sendSuccess(res, await doctorService.getDoctorById(id));
});

export const listDoctorPatients = asyncHandler(async (req, res) => {
  const { id } = validated(doctorIdParamsSchema, req.params);
  const query = validated(listDoctorPatientsQuerySchema, req.query);
  const { patients, meta } = await patientService.listDoctorPatients(id, query);
  sendSuccess(res, patients, 200, meta);
});

export const addDoctorPatient = asyncHandler(async (req, res) => {
  const { id } = validated(doctorIdParamsSchema, req.params);
  const patient = await patientService.addPatientToDoctor(
    id,
    validated(createPatientSchema, req.body),
  );
  sendSuccess(res, patient, 201);
});

export const removeDoctorPatient = asyncHandler(async (req, res) => {
  const { id, patientId } = validated(doctorPatientParamsSchema, req.params);
  sendSuccess(res, await patientService.removePatientFromDoctor(id, patientId));
});
