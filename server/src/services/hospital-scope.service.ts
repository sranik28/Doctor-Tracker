import type { Types } from 'mongoose';

import { DoctorModel } from '../models/doctor.model.js';

/**
 * Hospital is stored on the doctor, and patients only point at a doctor. To scope patient
 * queries to one hospital, resolve its doctor ids first (a covered index lookup on
 * hospital_1_createdAt_-1, a handful of ids) and match patients with `doctorId: { $in }`,
 * which the doctorId_1_* indexes serve. `undefined` means "all hospitals".
 */
export const getHospitalDoctorIds = async (
  hospital: string | undefined,
): Promise<Types.ObjectId[] | undefined> => {
  if (!hospital) return undefined;

  const doctors = await DoctorModel.find({ hospital }, { _id: 1 }).lean<
    { _id: Types.ObjectId }[]
  >();
  return doctors.map((doctor) => doctor._id);
};

/** `$match` fragment limiting patients to the given doctors; empty when unscoped. */
export const patientScopeMatch = (
  doctorIds: Types.ObjectId[] | undefined,
): { doctorId?: { $in: Types.ObjectId[] } } => (doctorIds ? { doctorId: { $in: doctorIds } } : {});
