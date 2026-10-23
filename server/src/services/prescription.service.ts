import type { Types } from 'mongoose';

import { type Prescription, PrescriptionModel } from '../models/prescription.model.js';
import { PatientModel } from '../models/patient.model.js';
import { ApiError } from '../utils/ApiError.js';
import type {
  CreatePrescriptionInput,
  ListPrescriptionsQuery,
  UpdatePrescriptionInput,
} from '../validations/prescription.validation.js';

interface DoctorSummary {
  _id: Types.ObjectId;
  name: string;
  specialization: string;
}

export type PrescriptionWithDoctor = Prescription & { doctor: DoctorSummary | null };

// One extra query per request (doctor ids batched with $in), never one per prescription.
const DOCTOR_POPULATE = { path: 'doctor', select: '_id name specialization' } as const;

const PRESCRIPTION_PROJECTION = {
  patientId: 1,
  doctorId: 1,
  medicine: 1,
  dosage: 1,
  duration: 1,
  instructions: 1,
  prescribedAt: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

export const PRESCRIPTION_SORT = { prescribedAt: -1, _id: -1 } as const;

const loadPrescription = async (prescriptionId: string): Promise<PrescriptionWithDoctor> => {
  const prescription = await PrescriptionModel.findById(prescriptionId, PRESCRIPTION_PROJECTION)
    .populate(DOCTOR_POPULATE)
    .lean<PrescriptionWithDoctor>();
  if (!prescription) throw ApiError.notFound('Prescription not found');
  return prescription;
};

export const listPatientPrescriptions = async (
  patientId: string,
  { limit }: ListPrescriptionsQuery,
): Promise<PrescriptionWithDoctor[]> => {
  if (!(await PatientModel.exists({ _id: patientId }))) {
    throw ApiError.notFound('Patient not found');
  }

  return PrescriptionModel.find({ patientId }, PRESCRIPTION_PROJECTION)
    .sort(PRESCRIPTION_SORT)
    .limit(limit)
    .populate(DOCTOR_POPULATE)
    .lean<PrescriptionWithDoctor[]>();
};

export const createPrescription = async (
  patientId: string,
  input: CreatePrescriptionInput,
): Promise<PrescriptionWithDoctor> => {
  const patient = await PatientModel.findById(patientId, { doctorId: 1 }).lean<{
    doctorId: Types.ObjectId;
  }>();
  if (!patient) throw ApiError.notFound('Patient not found');

  // Unsent optional fields are left out so the schema defaults apply.
  const fields = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );
  const created = await PrescriptionModel.create({
    ...fields,
    medicine: input.medicine,
    dosage: input.dosage,
    duration: input.duration,
    patientId,
    doctorId: patient.doctorId,
  });
  return loadPrescription(created._id.toString());
};

export const updatePrescription = async (
  prescriptionId: string,
  input: UpdatePrescriptionInput,
): Promise<PrescriptionWithDoctor> => {
  // Only fields that were actually sent are changed.
  const changes = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );

  const updated = await PrescriptionModel.findByIdAndUpdate(
    prescriptionId,
    { $set: changes },
    { runValidators: true, projection: { _id: 1 } },
  ).lean<{ _id: Types.ObjectId }>();
  if (!updated) throw ApiError.notFound('Prescription not found');

  return loadPrescription(prescriptionId);
};

export const deletePrescription = async (
  prescriptionId: string,
): Promise<{ _id: Types.ObjectId }> => {
  const deleted = await PrescriptionModel.findByIdAndDelete(prescriptionId, {
    projection: { _id: 1 },
  }).lean<{ _id: Types.ObjectId }>();
  if (!deleted) throw ApiError.notFound('Prescription not found');
  return { _id: deleted._id };
};

/** A deleted patient takes their prescriptions with them. */
export const deletePrescriptionsForPatient = async (patientId: Types.ObjectId): Promise<void> => {
  await PrescriptionModel.deleteMany({ patientId });
};
