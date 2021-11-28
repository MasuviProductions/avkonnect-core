import express from 'express';
import authHandler from './middlewares/authHandler';
import errorHandler from './middlewares/errorHandler';
import loggerHandler from './middlewares/loggerHandler';
import ROUTER from './routes';
import AUTH_ROUTER from './routes/auth';
import USER_ROUTER from './routes/user';

const APP = express();

APP.use(express.json());

// Middlesware
APP.use(loggerHandler);
APP.use(authHandler);

// Routes
APP.use('/api/v1/', ROUTER);
APP.use('/api/v1/auth', AUTH_ROUTER);
APP.use('/api/v1/users', USER_ROUTER);

APP.use(errorHandler);

export { APP };
