import jwt from 'jsonwebtoken';
import {
    ICognitoAccessTokenPayload,
    ICognitoUserInfoApiResponse,
    ICognitoUserPoolJWKKey,
    ICognitoUserPoolJWKsApiResponse,
    IJWTDecoded,
    IJWTHeader,
} from '../interfaces/jwt';
import jwkToPem, { JWK } from 'jwk-to-pem';
import { HttpError } from './error';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errors';
import { IncomingHttpHeaders } from 'http2';
import axios from 'axios';
import APP_URL from '../constants/api';

const getBearerTokenFromApiRequest = (httpHeaders: Readonly<IncomingHttpHeaders>): string | undefined => {
    const bearer = httpHeaders.authorization;
    if (!bearer) return;
    const token = bearer.split(/\s/)?.[1];
    return token;
};

const getJWKForTokenKid = async (kid: string): Promise<Readonly<ICognitoUserPoolJWKKey> | undefined> => {
    const cognitoUserpoolJWKs = await getCognitoUserPoolJWKs();
    const matchedJWK = await cognitoUserpoolJWKs.keys.find((jwk) => jwk.kid === kid);
    return matchedJWK;
};

const getCognitoUserPoolJWKs = async (): Promise<Readonly<ICognitoUserPoolJWKsApiResponse>> => {
    try {
        const axiosRes = await axios.get<Readonly<ICognitoUserPoolJWKsApiResponse>>(APP_URL.COGNITO_JWK);
        const cognitoUserpoolJWKs = await axiosRes.data;
        return cognitoUserpoolJWKs;
    } catch {
        throw new HttpError(ERROR_MESSAGES.COGNITO_JWKS_ERROR, 400, ERROR_CODES.THIRD_PARTY_ERROR);
    }
};

const decodeAccessToken = (token: string): IJWTDecoded => {
    const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString()) as IJWTHeader;
    const body = jwt.decode(token);
    return { header, body } as IJWTDecoded;
};

const verfiyAccessToken = async (token: string): Promise<Readonly<ICognitoAccessTokenPayload>> => {
    const decodedToken = decodeAccessToken(token);
    const matchedJWK = await getJWKForTokenKid(decodedToken.header.kid);
    if (!matchedJWK) {
        throw new HttpError(ERROR_MESSAGES.COGNITO_JWKS_ERROR, 400, ERROR_CODES.THIRD_PARTY_ERROR);
    }
    try {
        const jwkPublicKey: JWK = {
            e: matchedJWK.e,
            kty: 'RSA',
            n: matchedJWK.n,
        };
        const pem = jwkToPem(jwkPublicKey);
        const jwtPayload = jwt.verify(token, pem, {
            algorithms: [matchedJWK.alg],
        }) as Readonly<ICognitoAccessTokenPayload>;
        return jwtPayload;
    } catch (err) {
        throw new HttpError(ERROR_MESSAGES.INVALID_ACCESS_TOKEN, 401, ERROR_CODES.AUTHORIZATION_ERROR);
    }
};

const getCognitoUserInfo = async (token: string): Promise<Readonly<ICognitoUserInfoApiResponse>> => {
    try {
        const axiosRes = await axios.get<Readonly<ICognitoUserInfoApiResponse>>(APP_URL.COGNITO_USER_INFO, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const cognitoUserInfo = await axiosRes.data;
        return cognitoUserInfo;
    } catch {
        throw new HttpError(ERROR_MESSAGES.COGNITO_USER_ERROR, 400, ERROR_CODES.UNKNOWN_ERROR);
    }
};

export { getBearerTokenFromApiRequest, getCognitoUserInfo, verfiyAccessToken };
