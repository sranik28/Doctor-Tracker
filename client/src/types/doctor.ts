export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorListItem extends Doctor {
  patientCount: number;
}

export interface DoctorFilterOptions {
  specializations: string[];
  hospitals: string[];
}
