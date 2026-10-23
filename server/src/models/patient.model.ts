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

// A doctor's patients, newest first (also backs per-doctor counts).
patientSchema.index({ doctorId: 1, createdAt: -1 });
// Filter by condition, sorted by admission date.
patientSchema.index({ condition: 1, admittedAt: -1 });
// Admissions over time (charts, date-range filters).
patientSchema.index({ admittedAt: -1 });
// Search box.
patientSchema.index({ name: 'text' }, { name: 'patient_text_search' });

export const PatientModel = model<Patient>('Patient', patientSchema);
