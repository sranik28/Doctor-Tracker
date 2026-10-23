import { Router } from 'express';

import {
  getPublicDoctor,
  getPublicDoctorFilterOptions,
  listPublicDoctors,
} from '../controllers/public-doctor.controller.js';
import { publicCache } from '../middlewares/public-cache.js';
import { publicRateLimiter } from '../middlewares/rate-limit.js';
import { validate } from '../middlewares/validate.js';
import {
  listPublicDoctorsQuerySchema,
  publicDoctorIdParamsSchema,
} from '../validations/public-doctor.validation.js';

/** Anonymous, read-only, and limited to non-sensitive doctor fields. */
export const publicRouter = Router();

publicRouter.use(publicRateLimiter, publicCache);

publicRouter.get('/doctors', validate({ query: listPublicDoctorsQuerySchema }), listPublicDoctors);
// Must stay above "/doctors/:id" so "filters" isn't read as an id.
publicRouter.get('/doctors/filters/options', getPublicDoctorFilterOptions);
publicRouter.get('/doctors/:id', validate({ params: publicDoctorIdParamsSchema }), getPublicDoctor);
