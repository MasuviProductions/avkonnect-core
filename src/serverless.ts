import serverless from 'serverless-http';
import { APP } from '.';

module.exports.handler = serverless(APP);
