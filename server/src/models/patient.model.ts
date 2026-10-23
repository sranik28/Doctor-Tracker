import { type HydratedDocument, model, Schema, type Types } from 'mongoose';

export const PATIENT_GENDERS = ['male', 'female', 'other'] as const;
export type PatientGender = (typeof PATIENT_GENDERS)[number];

export interface Patient {
  _id: Types.ObjectId;
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  condition: string;
  doctorId: Types.ObjectId;
  admittedAt: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PatientDocument = HydratedDocument<Patient>;

const patientSchema = new Schema<Patient>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, required: true, min: 0, max: 150 },
    gender: { type: String, enum: PATIENT_GENDERS, required: true },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    condition: { type: String, required: true, trim: true, maxlength: 150 },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    admittedAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

/**
 * The assigned doctor's summary, loaded with `.populate('doctor')`. A virtual (rather than
 * populating doctorId itself) so doctorId always stays a plain id in responses.
 */
patientSchema.virtual('doctor', {
  ref: 'Doctor',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true,
});

// A doctor's patients, newest first (also backs per-doctor counts).
patientSchema.index({ doctorId: 1, createdAt: -1 });
// Patients list filtered by doctor, sorted by admission date (the list's default sort).
// Without it MongoDB finds the doctor's patients via doctorId_createdAt and sorts in memory.
patientSchema.index({ doctorId: 1, admittedAt: -1 });
// Filter by condition, sorted by admission date.
patientSchema.index({ condition: 1, admittedAt: -1 });
// Admissions over time (charts, date-range filters).
patientSchema.index({ admittedAt: -1 });
// Gender filter. Low selectivity, but without it the list's countDocuments({ gender })
// scans the whole collection; with it the count is an index-only COUNT_SCAN.
patientSchema.index({ gender: 1, admittedAt: -1 });
// Search box.
patientSchema.index({ name: 'text' }, { name: 'patient_text_search' });
// Sort A–Z / Z–A without scanning and sorting the whole collection.
patientSchema.index({ name: 1 });

export const PatientModel = model<Patient>('Patient', patientSchema);
