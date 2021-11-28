import express from 'express';
import cors from 'cors';
import authHandler from './middlewares/authHandler';
import errorHandler from './middlewares/errorHandler';
import loggerHandler from './middlewares/loggerHandler';
import ROUTER from './routes';
import AUTH_ROUTER from './routes/auth';
import USER_ROUTER from './routes/user';

const APP = express();

APP.use(cors());
APP.use(express.json());

// Middleware
APP.use(loggerHandler);

APP.use('/api/v1/test', ROUTER);

APP.use(authHandler);

// Routes
APP.use('/api/v1/auth', AUTH_ROUTER);
APP.use('/api/v1/users', USER_ROUTER);

APP.use(errorHandler);

export { APP };
