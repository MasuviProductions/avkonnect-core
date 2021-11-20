import express from 'express';
import serverless from 'serverless-http';
// import ENV from './constants/env';
import loggerHandler from './middlewares/loggerHandler';
import ROUTER from './routes';
// import LOGGER from './utils/logger';

const app = express();

// Middlesware
app.use(loggerHandler);

// Routes
app.use('/api/v1/', ROUTER);

// app.listen(ENV.PORT, () => LOGGER.info(`Server listening on port ${ENV.PORT}`));

module.exports.handler = serverless(app);
