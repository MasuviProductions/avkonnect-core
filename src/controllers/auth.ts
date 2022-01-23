import { NextFunction, Request, Response } from 'express';
import DBQueries from '../utils/db/queries';
import { HttpResponse } from '../interfaces/generic';
import asyncHandler from '../middlewares/asyncHandler';

const getAuthUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const authUser = req.authUser;
    const userIds = new Set<string>();
    userIds.add(authUser?.id as string);
    const [user] = await DBQueries.getUserInfoForIds(userIds);

    const response: HttpResponse = {
        success: true,
        data: user,
    };
    return res.status(200).json(response);
};

const AUTH_CONTROLLER = { getAuthUser: asyncHandler(getAuthUser) };

export default AUTH_CONTROLLER;
