import { NextFunction, Request, Response } from 'express';
import dynamoose from 'dynamoose';
import { ERROR_MESSAGES } from '../constants/errors';
import asyncHandler from '../middlewares/asyncHandler';
import { DBQueries } from '../utils/db/queries';
import { HttpError } from '../utils/error';
import { HttpResponse } from '../interfaces/generic';

const getUserProfile = asyncHandler(
    async (
        req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: NextFunction
    ) => {
        const userId = req.params.user_id;
        const authUser = req.user;
        if (!authUser || authUser.id !== userId) {
            throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_MESSAGES.FORBIDDEN_ACCESS);
        }
        const user = await DBQueries.getUserById(authUser.id as string);
        if (!user) {
            throw new HttpError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, 404, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
        }
        const response: HttpResponse = {
            success: true,
            data: user,
        };
        return res.status(200).json(response);
    }
);

const postFollowingForUser = asyncHandler(
    async (
        req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: NextFunction
    ) => {
        const userId = req.params.user_id;
        const followingId = req.params.following_id;
        const authUser = req.user;
        if (!authUser || authUser.id !== userId) {
            throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_MESSAGES.FORBIDDEN_ACCESS);
        }
        await dynamoose.transaction([
            DBQueries.updateUserFollowResourceTransaction(userId, followingId, 'following'),
            DBQueries.updateUserFollowResourceTransaction(followingId, userId, 'followers'),
        ]);
        const user = await DBQueries.getUserById(userId);
        const response: HttpResponse = {
            success: true,
            data: user.following,
        };
        return res.status(200).json(response);
    }
);

const deleteFollowingForUser = asyncHandler(
    async (
        req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _next: NextFunction
    ) => {
        const userId = req.params.user_id;
        const followingId = req.params.following_id;
        const authUser = req.user;
        if (!authUser || authUser.id !== userId) {
            throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_MESSAGES.FORBIDDEN_ACCESS);
        }
        await dynamoose.transaction([
            DBQueries.deleteUserFollowResourceTransaction(userId, followingId, 'following'),
            DBQueries.deleteUserFollowResourceTransaction(followingId, userId, 'followers'),
        ]);
        const user = await DBQueries.getUserById(userId);
        const response: HttpResponse = {
            success: true,
            data: user.following,
        };
        return res.status(200).json(response);
    }
);

export { getUserProfile, postFollowingForUser, deleteFollowingForUser };
