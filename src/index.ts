import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authHandler from './middlewares/authHandler';
import errorHandler from './middlewares/errorHandler';
import loggerHandler from './middlewares/loggerHandler';
import AUTH_ROUTER from './routes/auth';
import USER_ROUTER from './routes/user';
import initDynamoDB from './utils/db/client';
import routeExcludeHandler from './middlewares/routeExcludeHandler';

const APP = express();

initDynamoDB();

// Middleware
APP.use(cors({ origin: true }));
APP.use(helmet());
APP.use(express.json());
APP.use(loggerHandler);
APP.use(
    routeExcludeHandler(
        ['GET'],
        ['/api/v1/users/:user_id/displayPicture\\?thumbnail=(true|false)', '/api/v1/users/:user_id/displayPicture'],
        authHandler
    )
);

// API service routes
APP.use('/api/v1/auth', AUTH_ROUTER);
APP.use('/api/v1/users', USER_ROUTER);

APP.use(errorHandler);

export { APP };
