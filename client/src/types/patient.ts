export type PatientGender = 'male' | 'female' | 'other';

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
}
