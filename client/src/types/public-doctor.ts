/** The only doctor fields the public site receives: no contact details, no patient data. */
export interface PublicDoctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
}
