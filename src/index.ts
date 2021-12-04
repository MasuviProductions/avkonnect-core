import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authHandler from './middlewares/authHandler';
import errorHandler from './middlewares/errorHandler';
import loggerHandler from './middlewares/loggerHandler';
import ROUTER from './routes';
import AUTH_ROUTER from './routes/auth';
import USER_ROUTER from './routes/user';
import initDynamoDB from './utils/db/client';

const APP = express();

initDynamoDB();

// Middleware
APP.use(cors());
APP.use(helmet());
APP.use(express.json());
APP.use(loggerHandler);

// Test API service route
APP.use('/api/v1/test', ROUTER);

// Handle Authentication for APIs
APP.use(authHandler);
// API service routes
APP.use('/api/v1/auth', AUTH_ROUTER);
APP.use('/api/v1/users', USER_ROUTER);

APP.use(errorHandler);

export { APP };
