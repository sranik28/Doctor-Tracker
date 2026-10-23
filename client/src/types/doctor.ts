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

/** GET /doctors/:id returns the same shape as a list item. */
export type DoctorDetail = DoctorListItem;

export interface DoctorFilterOptions {
  specializations: string[];
  hospitals: string[];
}
