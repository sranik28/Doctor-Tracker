import { Router } from 'express';

import { authRouter } from './auth.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { doctorRouter } from './doctor.routes.js';
import { healthRouter } from './health.routes.js';
import { patientRouter } from './patient.routes.js';
import { prescriptionRouter } from './prescription.routes.js';
import { publicRouter } from './public.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/doctors', doctorRouter);
apiRouter.use('/patients', patientRouter);
apiRouter.use('/prescriptions', prescriptionRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/public', publicRouter);
