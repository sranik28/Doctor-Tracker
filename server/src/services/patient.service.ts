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
  ListPatientsQuery,
  PatientSort,
  UpdatePatientInput,
} from '../validations/patient.validation.js';
import { assertDoctorExists } from './doctor.service.js';
import { getHospitalDoctorIds, patientScopeMatch } from './hospital-scope.service.js';
import { deletePrescriptionsForPatient } from './prescription.service.js';

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

export const PATIENT_PROJECTION = {
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

  await deletePrescriptionsForPatient(deleted._id);
  return { _id: deleted._id };
};

// ---- Patients module (all patients, across doctors) ----

interface DoctorSummary {
  _id: Types.ObjectId;
  name: string;
  specialization: string;
}

export type PatientWithDoctor = PatientFields & { doctor: DoctorSummary | null };

// One extra query per request (doctor ids batched with $in), never one per patient.
const DOCTOR_POPULATE = { path: 'doctor', select: '_id name specialization' } as const;

export const PATIENT_SORT_STAGES: Record<PatientSort, Record<string, 1 | -1>> = {
  admittedAt: { admittedAt: 1 },
  '-admittedAt': { admittedAt: -1 },
  name: { name: 1 },
  '-name': { name: -1 },
  age: { age: 1 },
  '-age': { age: -1 },
  createdAt: { createdAt: 1 },
  '-createdAt': { createdAt: -1 },
};

/**
 * Equality filters (condition / doctorId) + admittedAt range/sort line up with the
 * { condition, admittedAt } and { doctorId, admittedAt } compound indexes.
 */
/**
 * `hospitalDoctorIds` are the doctors of the selected hospital (see hospital-scope.service);
 * `undefined` means all hospitals.
 */
export const buildPatientFilter = (
  {
    search,
    condition,
    doctorId,
    gender,
    from,
    to,
  }: Pick<ListPatientsQuery, 'search' | 'condition' | 'doctorId' | 'gender' | 'from' | 'to'>,
  hospitalDoctorIds?: Types.ObjectId[],
): QueryFilter<Patient> => {
  const filter: QueryFilter<Patient> = {};
  const textSearch = toTextSearch(search);

  if (textSearch) filter.$text = { $search: textSearch };
  if (condition) filter.condition = condition;
  if (hospitalDoctorIds) {
    // A doctor chosen outside the hospital matches nothing, rather than ignoring the hospital.
    const inHospital = doctorId && hospitalDoctorIds.some((id) => id.toString() === doctorId);
    filter.doctorId = doctorId ? (inHospital ? doctorId : { $in: [] }) : { $in: hospitalDoctorIds };
  } else if (doctorId) {
    filter.doctorId = doctorId;
  }
  if (gender) filter.gender = gender;
  if (from || to) {
    filter.admittedAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  }

  return filter;
};

export const listPatients = async (
  query: ListPatientsQuery,
): Promise<{ patients: PatientWithDoctor[]; meta: PaginationMeta }> => {
  const filter = buildPatientFilter(query, await getHospitalDoctorIds(query.hospital));

  const [patients, total] = await Promise.all([
    PatientModel.find(filter, PATIENT_PROJECTION)
      .sort(PATIENT_SORT_STAGES[query.sort])
      .skip(getSkip(query))
      .limit(query.limit)
      .populate(DOCTOR_POPULATE)
      .lean<PatientWithDoctor[]>(),
    // countDocuments({}) scans the collection; with no filter, read the stored count instead.
    Object.keys(filter).length === 0
      ? PatientModel.estimatedDocumentCount()
      : PatientModel.countDocuments(filter),
  ]);

  return { patients, meta: buildPaginationMeta(query, total) };
};

export const getPatientFilterOptions = async (): Promise<{ conditions: string[] }> => {
  const conditions = await PatientModel.distinct('condition');
  return {
    conditions: conditions
      .filter((value): value is string => typeof value === 'string')
      .sort((a, b) => a.localeCompare(b)),
  };
};

export const getPatientById = async (patientId: string): Promise<PatientWithDoctor> => {
  const patient = await PatientModel.findById(patientId, PATIENT_PROJECTION)
    .populate(DOCTOR_POPULATE)
    .lean<PatientWithDoctor>();

  if (!patient) throw ApiError.notFound('Patient not found');

  return patient;
};

export const updatePatient = async (
  patientId: string,
  input: UpdatePatientInput,
): Promise<PatientWithDoctor> => {
  if (input.doctorId && !(await DoctorModel.exists({ _id: input.doctorId }))) {
    throw new ApiError(400, 'INVALID_DOCTOR', 'Doctor not found', { field: 'doctorId' });
  }

  // Only fields that were actually sent are changed.
  const changes = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );

  const patient = await PatientModel.findByIdAndUpdate(
    patientId,
    { $set: changes },
    { returnDocument: 'after', runValidators: true, projection: PATIENT_PROJECTION },
  )
    .populate(DOCTOR_POPULATE)
    .lean<PatientWithDoctor>();

  if (!patient) throw ApiError.notFound('Patient not found');

  return patient;
};

export const deletePatient = async (patientId: string): Promise<{ _id: Types.ObjectId }> => {
  const deleted = await PatientModel.findByIdAndDelete(patientId, {
    projection: { _id: 1 },
  }).lean<{ _id: Types.ObjectId }>();

  if (!deleted) throw ApiError.notFound('Patient not found');

  await deletePrescriptionsForPatient(deleted._id);
  return { _id: deleted._id };
};

/** Latest admissions with their doctor's name; one page query plus one batched doctor lookup. */
export const listRecentPatients = (
  limit: number,
  hospitalDoctorIds?: Types.ObjectId[],
): Promise<PatientWithDoctor[]> =>
  PatientModel.find(patientScopeMatch(hospitalDoctorIds), PATIENT_PROJECTION)
    .sort({ admittedAt: -1 })
    .limit(limit)
    .populate(DOCTOR_POPULATE)
    .lean<PatientWithDoctor[]>();
