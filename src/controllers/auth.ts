import { NextFunction, Request, Response } from 'express';
import asyncHandler from '../middlewares/asyncHandler';

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

export { getAuthUser };
