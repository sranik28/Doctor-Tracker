import morgan from 'morgan';

import { isProduction } from '../config/env.js';

export const requestLogger = morgan(isProduction ? 'combined' : 'dev');
