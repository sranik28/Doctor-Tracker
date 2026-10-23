import { Router } from 'express';

import { deletePrescription, updatePrescription } from '../controllers/prescription.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import {
  prescriptionIdParamsSchema,
  updatePrescriptionSchema,
} from '../validations/prescription.validation.js';

/** Edit/delete one prescription. Listing and adding live under /patients/:id/prescriptions. */
export const prescriptionRouter = Router();

prescriptionRouter.use(authenticate, authorize('admin'));

prescriptionRouter.patch(
  '/:id',
  validate({ params: prescriptionIdParamsSchema, body: updatePrescriptionSchema }),
  updatePrescription,
);
prescriptionRouter.delete(
  '/:id',
  validate({ params: prescriptionIdParamsSchema }),
  deletePrescription,
);
