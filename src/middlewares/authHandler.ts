import { NextFunction, Request, Response } from 'express';
import { getAuthenticationTokenType, getTokenFromApiRequest } from '@masuviproductions/avkonnect-auth/lib';
import { AuthenticationToken } from '@masuviproductions/avkonnect-auth/lib/constants/app';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errors';
import { HttpError } from '../utils/error';
import asyncHandler from './asyncHandler';
import { handleAccessTokenValidation, handleBasicTokenValidation } from '../utils/auth';

const authHandler = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const authType = getAuthenticationTokenType(req.headers.authorization);
    const authToken = getTokenFromApiRequest(req.headers.authorization);

    if (!authToken) {
        throw new HttpError(ERROR_CODES.AUTHENTICATION_ERROR, 401, ERROR_MESSAGES.MISSING_ACCESS_TOKEN);
    }

    switch (authType) {
        case AuthenticationToken.Basic: {
            handleBasicTokenValidation(authToken);
            req.isUserToken = false;
            break;
        }
        case AuthenticationToken.Bearer: {
            req.authUser = await handleAccessTokenValidation(authToken);
            req.isUserToken = true;
            break;
        }
        default: {
            throw new HttpError(ERROR_CODES.AUTHENTICATION_ERROR, 401, ERROR_MESSAGES.MISSING_ACCESS_TOKEN);
        }
    }
    next();
});

export default authHandler;
