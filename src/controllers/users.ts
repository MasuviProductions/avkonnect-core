import { NextFunction, Request, Response } from 'express';
import { ERROR_MESSAGES } from '../constants/errors';
import asyncHandler from '../middlewares/asyncHandler';
import { DBQueries } from '../utils/db/queries';
import { HttpErrorResponse } from '../utils/error';

const getUser = asyncHandler(
    async (
        req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: NextFunction
    ) => {
        const userId = req.params.id;
        const user = await DBQueries.getUser(req.user?.id as string, req.user?.email as string);

        if (!user) {
            throw new HttpErrorResponse(ERROR_MESSAGES.RESOURCE_NOT_FOUND, 404, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }

        if (user.id !== userId) {
            throw new HttpErrorResponse(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_MESSAGES.FORBIDDEN_ACCESS);
        }

        return res.status(200).json(user);
    }
);

const getAuthUser = asyncHandler(
    async (
        req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: NextFunction
    ) => {
        return res.status(200).json(req.user);
    }
);

export { getUser, getAuthUser };
