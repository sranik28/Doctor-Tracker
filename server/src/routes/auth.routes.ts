import { Router } from 'express';

import { login, logout, me, refresh } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { loginRateLimiter } from '../middlewares/rate-limit.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema } from '../validations/auth.validation.js';

export const authRouter = Router();

authRouter.post('/login', loginRateLimiter, validate({ body: loginSchema }), login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticate, me);
