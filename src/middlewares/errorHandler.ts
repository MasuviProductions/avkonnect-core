import { NextFunction, Request, Response } from 'express';
import { ERROR_CODES } from '../constants/errors';
import { HttpErrorResponse } from '../utils/error';

const errorHandler = (
    err: HttpErrorResponse,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): Response => {
    return res.status(err.statusCode ?? 500).send({
        success: false,
        error: {
            message: err.message || 'Server Error',
            errorCode: err.errorCode || ERROR_CODES.UNKNOWN_ERROR,
        },
    });
};

export default errorHandler;
