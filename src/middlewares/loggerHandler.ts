import { NextFunction, Request, Response } from 'express';
import LOGGER from '../utils/logger';

const loggerHandler = (req: Request, _res: Response, next: NextFunction) => {
    LOGGER.info(req.url);
    next();
};

export default loggerHandler;
