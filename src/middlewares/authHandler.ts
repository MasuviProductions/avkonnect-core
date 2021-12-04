import { NextFunction, Request, Response } from 'express';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errors';
import { IUser } from '../models/user';
import { getBearerTokenFromApiRequest, getCognitoUserInfo, verfiyAccessToken } from '../utils/auth';
import { getMinifiedUser, getNewUserModelFromJWTUserPayload } from '../utils/db/helpers';
import { DBQueries } from '../utils/db/queries';
import { HttpError } from '../utils/error';
import asyncHandler from './asyncHandler';

const authHandler = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const accessToken = getBearerTokenFromApiRequest(req.headers);
    if (accessToken) {
        let jwtUserPayload;
        await verfiyAccessToken(accessToken);
        const cognitoUserInfo = await getCognitoUserInfo(accessToken);
        // TODO: Merge user in cognito  pool
        try {
            const user = await DBQueries.getUserByEmail(cognitoUserInfo.email);
            jwtUserPayload = user;
        } catch {
            const newUser: IUser = getNewUserModelFromJWTUserPayload(cognitoUserInfo);
            const createdUser = (await DBQueries.createUser(newUser)) as IUser;
            jwtUserPayload = createdUser;
        }
        req.user = getMinifiedUser(jwtUserPayload);
    } else throw new HttpError(ERROR_CODES.AUTHENTICATION_ERROR, 401, ERROR_MESSAGES.MISSING_ACCESS_TOKEN);
    next();
});

export default authHandler;
