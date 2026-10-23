import { type Doctor, DoctorModel } from '../models/doctor.model.js';
import type { PaginationMeta } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPaginationMeta, getSkip } from '../utils/pagination.js';
import type {
  ListPublicDoctorsQuery,
  PublicDoctorSort,
} from '../validations/public-doctor.validation.js';
import { buildDoctorFilter } from './doctor.service.js';

/** What the public site may see. No phone, email or patient data, ever. */
export type PublicDoctor = Pick<Doctor, '_id' | 'name' | 'specialization' | 'hospital'>;

export const PUBLIC_DOCTOR_PROJECTION = { name: 1, specialization: 1, hospital: 1 } as const;

// Every option is index-backed (name_1, createdAt_-1).
export const PUBLIC_DOCTOR_SORT_STAGES: Record<PublicDoctorSort, Record<string, 1 | -1>> = {
  name: { name: 1 },
  '-name': { name: -1 },
  '-createdAt': { createdAt: -1 },
};

export const listPublicDoctors = async (
  query: ListPublicDoctorsQuery,
): Promise<{ doctors: PublicDoctor[]; meta: PaginationMeta }> => {
  const filter = buildDoctorFilter({
    search: query.search,
    specialization: query.specialization,
    hospital: query.hospital,
    from: undefined,
    to: undefined,
  });

  const [doctors, total] = await Promise.all([
    DoctorModel.find(filter, PUBLIC_DOCTOR_PROJECTION)
      .sort(PUBLIC_DOCTOR_SORT_STAGES[query.sort])
      .skip(getSkip(query))
      .limit(query.limit)
      .lean<PublicDoctor[]>(),
    Object.keys(filter).length === 0
      ? DoctorModel.estimatedDocumentCount()
      : DoctorModel.countDocuments(filter),
  ]);

  return { doctors, meta: buildPaginationMeta(query, total) };
};

export const getPublicDoctorById = async (doctorId: string): Promise<PublicDoctor> => {
  const doctor = await DoctorModel.findById(
    doctorId,
    PUBLIC_DOCTOR_PROJECTION,
  ).lean<PublicDoctor>();
  if (!doctor) throw ApiError.notFound('Doctor not found');
  return doctor;
};
