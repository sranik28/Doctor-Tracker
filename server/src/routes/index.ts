import { Router } from 'express';

import { authRouter } from './auth.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { doctorRouter } from './doctor.routes.js';
import { healthRouter } from './health.routes.js';
import { patientRouter } from './patient.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/doctors', doctorRouter);
apiRouter.use('/patients', patientRouter);
apiRouter.use('/dashboard', dashboardRouter);
