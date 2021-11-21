import express from 'express';
import loggerHandler from './middlewares/loggerHandler';
import ROUTER from './routes';

const APP = express();

// Middlesware
APP.use(loggerHandler);

// Routes
APP.use('/api/v1/', ROUTER);

export { APP };
