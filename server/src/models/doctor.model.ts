import { type HydratedDocument, model, Schema, type Types } from 'mongoose';

export interface Doctor {
  _id: Types.ObjectId;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DoctorDocument = HydratedDocument<Doctor>;

const doctorSchema = new Schema<Doctor>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    specialization: { type: String, required: true, trim: true, maxlength: 100 },
    hospital: { type: String, required: true, trim: true, maxlength: 150 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

// Lookup + uniqueness on email.
doctorSchema.index({ email: 1 }, { unique: true });
// Filter by specialization, newest first (list page + stats).
doctorSchema.index({ specialization: 1, createdAt: -1 });
// Default list sort and date-range filter.
doctorSchema.index({ createdAt: -1 });
// Sort by name (A-Z / Z-A).
doctorSchema.index({ name: 1 });
// Filter by hospital, newest first; also serves distinct('hospital') for filter options.
doctorSchema.index({ hospital: 1, createdAt: -1 });
// Public directory: specialization / hospital filter, sorted A-Z (its default), without an
// in-memory sort. The createdAt variants above keep serving the admin list's default order.
doctorSchema.index({ specialization: 1, name: 1 });
doctorSchema.index({ hospital: 1, name: 1 });
// Search box: name weighs more than hospital.
doctorSchema.index(
  { name: 'text', hospital: 'text' },
  { name: 'doctor_text_search', weights: { name: 3, hospital: 1 } },
);

export const DoctorModel = model<Doctor>('Doctor', doctorSchema);
