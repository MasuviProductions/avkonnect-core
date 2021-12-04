import { NextFunction, Request, Response } from 'express';
import { ERROR_CODES } from '../constants/errors';
import { HttpResponse, HttpResponseError } from '../interfaces/generic';
import { HttpError } from '../utils/error';
import LOGGER from '../utils/logger';

const errorHandler = (
    err: HttpError,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): Response => {
    const error: HttpResponseError = {
        message: err.message || 'Server Error',
        code: err.errorCode || ERROR_CODES.UNKNOWN_ERROR,
    };
    LOGGER.danger(JSON.stringify(error));
    const response: HttpResponse = {
        success: false,
        error: error,
    };
    return res.status(err.statusCode ?? 500).send(response);
};

export default errorHandler;
