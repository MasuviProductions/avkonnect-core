import express from 'express';
import serverless from 'serverless-http';
// import ENV from './constants/env';
import loggerHandler from './middlewares/loggerHandler';
import ROUTER from './routes';
// import LOGGER from './utils/logger';

const APP = express();

// Middlesware
APP.use(loggerHandler);

// Routes
APP.use('/api/v1/', ROUTER);

const handler = () => serverless(APP);

export { handler };
export default APP;
