import express from 'express';
import serverless, { Handler } from 'serverless-http';
import loggerHandler from './middlewares/loggerHandler';
import ROUTER from './routes';

const APP = express();

// Middlesware
APP.use(loggerHandler);

// Routes
APP.use('/api/v1/', ROUTER);

const handler = (): Handler => serverless(APP);

export { handler };
export default APP;
