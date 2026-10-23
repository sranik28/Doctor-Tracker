import { Router } from 'express';

import {
  addDoctorPatient,
  createDoctor,
  getDoctor,
  getDoctorFilterOptions,
  listDoctorPatients,
  listDoctors,
  removeDoctorPatient,
} from '../controllers/doctor.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  createDoctorSchema,
  doctorIdParamsSchema,
  listDoctorsQuerySchema,
} from '../validations/doctor.validation.js';
import {
  createPatientSchema,
  doctorPatientParamsSchema,
  listDoctorPatientsQuerySchema,
} from '../validations/patient.validation.js';

export const doctorRouter = Router();

doctorRouter.use(authenticate, authorize('admin'));

doctorRouter.get('/', validate({ query: listDoctorsQuerySchema }), listDoctors);
doctorRouter.post('/', validate({ body: createDoctorSchema }), createDoctor);

// Must stay above "/:id" so "filters" isn't read as an id.
doctorRouter.get('/filters/options', getDoctorFilterOptions);

doctorRouter.get('/:id', validate({ params: doctorIdParamsSchema }), getDoctor);

doctorRouter.get(
  '/:id/patients',
  validate({ params: doctorIdParamsSchema, query: listDoctorPatientsQuerySchema }),
  listDoctorPatients,
);
doctorRouter.post(
  '/:id/patients',
  validate({ params: doctorIdParamsSchema, body: createPatientSchema }),
  addDoctorPatient,
);
doctorRouter.delete(
  '/:id/patients/:patientId',
  validate({ params: doctorPatientParamsSchema }),
  removeDoctorPatient,
);
