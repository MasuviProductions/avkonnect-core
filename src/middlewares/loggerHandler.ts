import { NextFunction, Request, Response } from 'express';
import { uuid } from 'uuidv4';
import LOGGER from '../utils/logger';
import asyncHandler from './asyncHandler';

const loggerHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const traceID = uuid();
    const originalSendFunc = res.send.bind(res);
    res.send = (body: unknown) => {
        LOGGER.info(`TraceId: ${traceID}`);
        LOGGER.info(
            `TraceId: ${traceID}, API Request: ${JSON.stringify({
                url: req.url,
                method: req.method,
                requestPayload: req.body,
            })}`
        );
        LOGGER.info(
            `TraceId: ${traceID}, API Response: ${JSON.stringify({
                url: req.url,
                method: req.method,
                status: res.statusCode,
                responsePayload: body,
            })}`
        );
        LOGGER.info(`TraceId: ${traceID}`);

        return originalSendFunc(body);
    };
    next();
});

export default loggerHandler;
