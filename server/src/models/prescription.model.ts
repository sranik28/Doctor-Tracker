import { type HydratedDocument, model, Schema, type Types } from 'mongoose';

export interface Prescription {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  /** The doctor who prescribed it: the patient's doctor at the time it was recorded. */
  doctorId: Types.ObjectId;
  medicine: string;
  /** Free text, e.g. "500 mg, twice a day". */
  dosage: string;
  /** Free text, e.g. "7 days". */
  duration: string;
  instructions: string;
  prescribedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PrescriptionDocument = HydratedDocument<Prescription>;

const prescriptionSchema = new Schema<Prescription>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    medicine: { type: String, required: true, trim: true, maxlength: 100 },
    dosage: { type: String, required: true, trim: true, maxlength: 100 },
    duration: { type: String, required: true, trim: true, maxlength: 60 },
    instructions: { type: String, trim: true, maxlength: 500, default: '' },
    prescribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

/** The prescribing doctor's summary, loaded with `.populate('doctor')`. */
prescriptionSchema.virtual('doctor', {
  ref: 'Doctor',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true,
});

// A patient's prescriptions, newest first (the only way they are listed). _id breaks ties so
// the whole sort comes from the index.
prescriptionSchema.index({ patientId: 1, prescribedAt: -1, _id: -1 });

export const PrescriptionModel = model<Prescription>('Prescription', prescriptionSchema);
