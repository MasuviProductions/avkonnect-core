import { NextFunction, Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
import LOGGER from '../utils/logger';

const getAuthUser = asyncHandler(
    async (
        req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: NextFunction
    ) => {
        const user = req.user;

        LOGGER.warn(JSON.stringify(user));
        return res.status(200).json(user);
    }
);

export { getAuthUser };
