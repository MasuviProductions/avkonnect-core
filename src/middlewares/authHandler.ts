import { NextFunction, Request, Response } from 'express';
import {
    getBearerTokenFromApiRequest,
    getCognitoUserInfo,
    verfiyAccessToken,
} from '@masuviproductions/avkonnect-auth/lib';
import NodeCache from 'node-cache';
import { IAuthUser } from '../interfaces/api';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errors';
import { IUser } from '../models/user';
import { getNewUserModelFromJWTUserPayload } from '../utils/db/helpers';
import DBQueries from '../utils/db/queries';
import { HttpError } from '../utils/error';
import asyncHandler from './asyncHandler';

const authCache = new NodeCache({ stdTTL: 600, deleteOnExpire: true });

const authHandler = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const accessToken = getBearerTokenFromApiRequest(req.headers);

    if (accessToken) {
        let authUser: IAuthUser | undefined;
        const authUserCache = authCache.get(accessToken);
        if (!authUserCache) {
            try {
                await verfiyAccessToken(accessToken);
            } catch {
                throw new HttpError(ERROR_MESSAGES.INVALID_ACCESS_TOKEN, 401, ERROR_CODES.AUTHORIZATION_ERROR);
            }
            try {
                const cognitoUserInfo = await getCognitoUserInfo(accessToken);
                // TODO: Merge user in cognito  pool
                const user = await DBQueries.getAuthUserByEmail(cognitoUserInfo.email);
                if (!user) {
                    const newUser: IUser = await getNewUserModelFromJWTUserPayload(cognitoUserInfo);
                    const createdUser = await DBQueries.createUser(newUser);
                    authUser = createdUser;
                } else {
                    authUser = user;
                }
                authCache.set(accessToken, authUser);
            } catch {
                throw new HttpError(ERROR_MESSAGES.COGNITO_USER_ERROR, 400, ERROR_CODES.UNKNOWN_ERROR);
            }
        } else {
            authUser = authUserCache as IAuthUser;
        }
        req.authUser = authUser;
    } else throw new HttpError(ERROR_CODES.AUTHENTICATION_ERROR, 401, ERROR_MESSAGES.MISSING_ACCESS_TOKEN);
    next();
});

export default authHandler;
