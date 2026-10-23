import type { QueryFilter, Types } from 'mongoose';

import { type Doctor, DoctorModel } from '../models/doctor.model.js';
import { PatientModel } from '../models/patient.model.js';
import type { PaginationMeta } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPaginationMeta, getSkip } from '../utils/pagination.js';
import { toTextSearch } from '../utils/text-search.js';
import type {
  CreateDoctorInput,
  DoctorSort,
  ListDoctorsQuery,
} from '../validations/doctor.validation.js';

type DoctorFields = Pick<
  Doctor,
  '_id' | 'name' | 'specialization' | 'hospital' | 'phone' | 'email' | 'createdAt' | 'updatedAt'
>;

export type DoctorWithPatientCount = DoctorFields & { patientCount: number };

export interface DoctorFilterOptions {
  specializations: string[];
  hospitals: string[];
}

const DOCTOR_PROJECTION = {
  name: 1,
  specialization: 1,
  hospital: 1,
  phone: 1,
  email: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

// Each option is backed by an index, so sorting never needs a collection scan.
const SORT_STAGES: Record<DoctorSort, Record<string, 1 | -1>> = {
  createdAt: { createdAt: 1 },
  '-createdAt': { createdAt: -1 },
  name: { name: 1 },
  '-name': { name: -1 },
};

export const buildDoctorFilter = ({
  search,
  specialization,
  hospital,
  from,
  to,
}: Pick<
  ListDoctorsQuery,
  'search' | 'specialization' | 'hospital' | 'from' | 'to'
>): QueryFilter<Doctor> => {
  const filter: QueryFilter<Doctor> = {};
  const textSearch = toTextSearch(search);

  if (textSearch) filter.$text = { $search: textSearch };
  if (specialization) filter.specialization = specialization;
  if (hospital) filter.hospital = hospital;
  if (from || to) {
    filter.createdAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  }

  return filter;
};

/** Patient counts for many doctors in ONE grouped query (index-covered on doctorId). */
const countPatientsByDoctor = async (doctorIds: Types.ObjectId[]): Promise<Map<string, number>> => {
  if (doctorIds.length === 0) return new Map();

  const rows = await PatientModel.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { doctorId: { $in: doctorIds } } },
    { $group: { _id: '$doctorId', count: { $sum: 1 } } },
  ]);

  return new Map(rows.map(({ _id, count }) => [_id.toString(), count]));
};

export const listDoctors = async (
  query: ListDoctorsQuery,
): Promise<{ doctors: DoctorWithPatientCount[]; meta: PaginationMeta }> => {
  const filter = buildDoctorFilter(query);

  const [doctors, total] = await Promise.all([
    DoctorModel.find(filter, DOCTOR_PROJECTION)
      .sort(SORT_STAGES[query.sort])
      .skip(getSkip(query))
      .limit(query.limit)
      .lean<DoctorFields[]>(),
    // countDocuments({}) scans the whole collection; with no filter, read the stored count instead.
    Object.keys(filter).length === 0
      ? DoctorModel.estimatedDocumentCount()
      : DoctorModel.countDocuments(filter),
  ]);

  const patientCounts = await countPatientsByDoctor(doctors.map((doctor) => doctor._id));

  return {
    doctors: doctors.map((doctor) => ({
      ...doctor,
      patientCount: patientCounts.get(doctor._id.toString()) ?? 0,
    })),
    meta: buildPaginationMeta(query, total),
  };
};

export const createDoctor = async (input: CreateDoctorInput): Promise<DoctorWithPatientCount> => {
  const doctor = await DoctorModel.create(input);
  const { _id, name, specialization, hospital, phone, email, createdAt, updatedAt } = doctor;
  return {
    _id,
    name,
    specialization,
    hospital,
    phone,
    email,
    createdAt,
    updatedAt,
    patientCount: 0,
  };
};

export const getDoctorById = async (doctorId: string): Promise<DoctorWithPatientCount> => {
  const [doctor, patientCount] = await Promise.all([
    DoctorModel.findById(doctorId, DOCTOR_PROJECTION).lean<DoctorFields>(),
    PatientModel.countDocuments({ doctorId }),
  ]);

  if (!doctor) throw ApiError.notFound('Doctor not found');

  return { ...doctor, patientCount };
};

export const getDoctorFilterOptions = async (): Promise<DoctorFilterOptions> => {
  const [specializations, hospitals] = await Promise.all([
    DoctorModel.distinct('specialization'),
    DoctorModel.distinct('hospital'),
  ]);

  const toSortedStrings = (values: unknown[]): string[] =>
    values
      .filter((value): value is string => typeof value === 'string')
      .sort((a, b) => a.localeCompare(b));

  return {
    specializations: toSortedStrings(specializations),
    hospitals: toSortedStrings(hospitals),
  };
};

export const assertDoctorExists = async (doctorId: string): Promise<void> => {
  if (!(await DoctorModel.exists({ _id: doctorId }))) {
    throw ApiError.notFound('Doctor not found');
  }
};
