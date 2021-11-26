import { NextFunction, Request, Response } from 'express';
import { HttpErrorResponse } from '../utils/error';

const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
    (req: Request, res: Response, next: NextFunction): Promise<unknown> =>
        Promise.resolve(fn(req, res, next)).catch((err: HttpErrorResponse) => next(err));

export default asyncHandler;
