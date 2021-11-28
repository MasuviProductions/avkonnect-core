import { NextFunction, Request, Response } from 'express';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errors';
import { IUser } from '../models/user';
import { getBearerTokenFromApiRequest, getCognitoUserInfo, verfiyAccessToken } from '../utils/auth';
import { getNewUserModelFromJWTUserPayload } from '../utils/db/helpers';
import { DBQueries } from '../utils/db/queries';
import { HttpErrorResponse } from '../utils/error';
import asyncHandler from './asyncHandler';

const authHandler = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const accessToken = getBearerTokenFromApiRequest(req.headers);
    if (accessToken) {
        let jwtUserPayload;
        const accessTokenPayload = await verfiyAccessToken(accessToken);
        console.log(accessTokenPayload);
        const cognitoUserInfo = await getCognitoUserInfo(accessToken);
        const user = await DBQueries.getUser(cognitoUserInfo.sub, cognitoUserInfo.email);
        if (!user) {
            const newUser: IUser = getNewUserModelFromJWTUserPayload(cognitoUserInfo);
            const createdUser = (await DBQueries.createUser(newUser)) as IUser;
            jwtUserPayload = createdUser;
        } else {
            jwtUserPayload = user;
        }
        req.user = jwtUserPayload;
    } else throw new HttpErrorResponse(ERROR_CODES.AUTHENTICATION_ERROR, 401, ERROR_MESSAGES.MISSING_ACCESS_TOKEN);
    next();
});

export default authHandler;
