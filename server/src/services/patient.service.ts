import type { QueryFilter, Types } from 'mongoose';

import { DoctorModel } from '../models/doctor.model.js';
import { type Patient, PatientModel } from '../models/patient.model.js';
import type { PaginationMeta } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPaginationMeta, getSkip } from '../utils/pagination.js';
import { toTextSearch } from '../utils/text-search.js';
import type {
  CreatePatientInput,
  ListDoctorPatientsQuery,
} from '../validations/patient.validation.js';
import { assertDoctorExists } from './doctor.service.js';

type PatientFields = Pick<
  Patient,
  | '_id'
  | 'name'
  | 'age'
  | 'gender'
  | 'phone'
  | 'condition'
  | 'doctorId'
  | 'admittedAt'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'
>;

const PATIENT_PROJECTION = {
  name: 1,
  age: 1,
  gender: 1,
  phone: 1,
  condition: 1,
  doctorId: 1,
  admittedAt: 1,
  notes: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

/** A doctor's patients, newest first. Served by the { doctorId: 1, createdAt: -1 } index. */
export const listDoctorPatients = async (
  doctorId: string,
  query: ListDoctorPatientsQuery,
): Promise<{ patients: PatientFields[]; meta: PaginationMeta }> => {
  const filter: QueryFilter<Patient> = { doctorId };
  const textSearch = toTextSearch(query.search);
  if (textSearch) filter.$text = { $search: textSearch };

  const [doctorExists, patients, total] = await Promise.all([
    DoctorModel.exists({ _id: doctorId }),
    PatientModel.find(filter, PATIENT_PROJECTION)
      .sort({ createdAt: -1 })
      .skip(getSkip(query))
      .limit(query.limit)
      .lean<PatientFields[]>(),
    PatientModel.countDocuments(filter),
  ]);

  if (!doctorExists) throw ApiError.notFound('Doctor not found');

  return { patients, meta: buildPaginationMeta(query, total) };
};

export const addPatientToDoctor = async (
  doctorId: string,
  input: CreatePatientInput,
): Promise<PatientFields> => {
  await assertDoctorExists(doctorId);

  // Optional fields are only set when provided, so schema defaults apply otherwise.
  const { admittedAt, notes, ...required } = input;
  const patient = await PatientModel.create({
    ...required,
    doctorId,
    ...(admittedAt && { admittedAt }),
    ...(notes !== undefined && { notes }),
  });

  return {
    _id: patient._id,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    phone: patient.phone,
    condition: patient.condition,
    doctorId: patient.doctorId,
    admittedAt: patient.admittedAt,
    notes: patient.notes,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
};

/** Deletes only if the patient belongs to this doctor; any mismatch is a 404. */
export const removePatientFromDoctor = async (
  doctorId: string,
  patientId: string,
): Promise<{ _id: Types.ObjectId }> => {
  const deleted = await PatientModel.findOneAndDelete(
    { _id: patientId, doctorId },
    { projection: { _id: 1 } },
  ).lean<{ _id: Types.ObjectId }>();

  if (!deleted) throw ApiError.notFound('Patient not found for this doctor');

  return { _id: deleted._id };
};
