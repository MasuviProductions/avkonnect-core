import { NextFunction, Request, Response } from 'express';
import LOGGER from '../utils/logger';
import asyncHandler from './asyncHandler';

const loggerHandler = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    LOGGER.info(JSON.stringify({ url: req.url, body: req.body }));
    next();
});

export default loggerHandler;
