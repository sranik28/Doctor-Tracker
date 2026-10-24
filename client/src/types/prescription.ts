export interface PrescriptionDoctor {
  _id: string;
  name: string;
  specialization: string;
}

export interface Prescription {
  _id: string;
  patientId: string;
  doctorId: string;
  medicine: string;
  dosage: string;
  duration: string;
  instructions: string;
  prescribedAt: string;
  createdAt: string;
  updatedAt: string;
  doctor: PrescriptionDoctor | null;
}
