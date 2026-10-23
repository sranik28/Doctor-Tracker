import { Router } from 'express';

import {
  deletePatient,
  getPatient,
  getPatientFilterOptions,
  listPatients,
  updatePatient,
} from '../controllers/patient.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  listPatientsQuerySchema,
  patientIdParamsSchema,
  updatePatientSchema,
} from '../validations/patient.validation.js';

export const patientRouter = Router();

patientRouter.use(authenticate, authorize('admin'));

patientRouter.get('/', validate({ query: listPatientsQuerySchema }), listPatients);

// Must stay above "/:id" so "filters" isn't read as an id.
patientRouter.get('/filters/options', getPatientFilterOptions);

patientRouter.get('/:id', validate({ params: patientIdParamsSchema }), getPatient);
patientRouter.patch(
  '/:id',
  validate({ params: patientIdParamsSchema, body: updatePatientSchema }),
  updatePatient,
);
patientRouter.delete('/:id', validate({ params: patientIdParamsSchema }), deletePatient);
