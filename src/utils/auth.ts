import { getCognitoUserInfo, verfiyAccessToken, verifyBasicToken } from '@masuviproductions/avkonnect-auth/lib';
import NodeCache from 'node-cache';
import { IAuthUser } from '../interfaces/api';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errors';
import { IUser } from '../models/user';
import { getNewUserModelFromJWTUserPayload } from '../utils/db/helpers';
import DBQueries from '../utils/db/queries';
import { HttpError } from '../utils/error';

const authCache = new NodeCache({ stdTTL: 600, deleteOnExpire: true });

export const handleBasicTokenValidation = (basicToken: string) => {
    if (!verifyBasicToken(basicToken)) {
        throw new HttpError(ERROR_MESSAGES.INVALID_ACCESS_TOKEN, 401, ERROR_CODES.AUTHENTICATION_ERROR);
    }
};

export const handleAccessTokenValidation = async (accessToken: string): Promise<IAuthUser> => {
    let authUser: IAuthUser | undefined;
    const authUserCache = authCache.get(accessToken);
    if (!authUserCache) {
        try {
            await verfiyAccessToken(accessToken);
        } catch {
            throw new HttpError(ERROR_MESSAGES.INVALID_ACCESS_TOKEN, 401, ERROR_CODES.AUTHENTICATION_ERROR);
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
    return authUser;
};
