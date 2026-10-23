export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  patientsThisMonth: number;
  patientsLastMonth: number;
  /** Month-over-month % change; null when last month had no patients to compare to. */
  growthPercent: number | null;
}

export type TimelineRange = '7d' | '30d' | '12m';

export interface TimelinePoint {
  /** "YYYY-MM-DD" for 7d/30d, "YYYY-MM" for 12m. */
  date: string;
  count: number;
}

export interface DoctorPatientCount {
  doctorId: string;
  name: string;
  specialization: string;
  count: number;
}

export interface ConditionCount {
  condition: string;
  count: number;
}

export interface SpecializationCount {
  specialization: string;
  doctorCount: number;
}
