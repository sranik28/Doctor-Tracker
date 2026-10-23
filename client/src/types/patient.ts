export type PatientGender = 'male' | 'female' | 'other';

export interface PatientDoctor {
  _id: string;
  name: string;
  specialization: string;
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  condition: string;
  doctorId: string;
  admittedAt: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  /** Included by the patients-wide endpoints; absent on a doctor's own patient list. */
  doctor?: PatientDoctor | null;
}
