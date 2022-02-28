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
import mongoose from 'mongoose';
const APP = express();

initDynamoDB();

/** connection to mongoose **/
const MONGO_OPTIONS = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    socketTimeoutMS: 30000,
    keepAlive: true,
    // poolSize: 50,
    autoIndex: false,
    retryWrites: false,
};
mongoose
    .connect(
        `mongodb+srv://${process.env.MONGO}:${process.env.MONGO_PASS}@cluster0.sesb2.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`,
        MONGO_OPTIONS
    )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .then((result) => console.log('connected mongodb'))
    .catch((error) => console.log(error));

// Middleware
APP.use(cors({ origin: '*', methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], preflightContinue: false }));
APP.use(helmet());
APP.use(express.json());
APP.use(loggerHandler);
APP.use(
    routeExcludeHandler(
        ['GET'],
        [
            '/api/v1/users/:user_id/displayPicture\\?thumbnail=(true|false)',
            '/api/v1/users/:user_id/displayPicture',
            '/api/v1/users/:user_id/backgroundPicture',
            '/api/v1/users/:user_id/mongo',
        ],
        authHandler
    )
);

// API service routes
APP.use('/api/v1/auth', AUTH_ROUTER);
APP.use('/api/v1/users', USER_ROUTER);

APP.use(errorHandler);

export { APP };
