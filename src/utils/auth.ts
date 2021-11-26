import jwt from 'jsonwebtoken';
import { IJwtUserPayload } from '../interfaces/jwt';
import jwkToPem, { JWK } from 'jwk-to-pem';
import { HttpErrorResponse } from './error';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errors';
import { IncomingHttpHeaders } from 'http2';

// TODO: Fetch dynamically from cognito jwks.json api
const jwkPublicKey: JWK = {
    // alg: 'RS256',
    e: 'AQAB',
    // kid: '+I2Mn2AJbOrWUerSgrluxX/iyWO5bX35l+7b4FIPCQE=',
    kty: 'RSA',
    n: 'yXKGAlu0BSQhpGDMJaM2DuYCTp_ReGhm7MhpYg5aQWx2isrKkVuQbUR7KXjWOSE_o64kUnkgQX-lcFRnfn4FZJWegVtL07Q-gGaNtMiqEd5YzGZqNxgcI-wrPPkjQHoub0WCIEWJSZMSDygvlopee8aHptOTd1-yczC_4rckNnVmQkxTlTkmcg3nIj3ANi-aYS9fcREaJamnOmuWc8D98zFfMJCewAXKHpl8uhjo5druarsbjbUjFg0bUkFuYmke1AMwsZIvTXZst40XfgsNPLD9ebJ0oER-FxR817di9Ltr_JYlTRbqVDQVD9fJ2MlX-sJJIkK8uaiY_QI3wL3xLw',
    // use: 'sig',
};

const verfiyAccessToken = (token: string): IJwtUserPayload => {
    try {
        const pem = jwkToPem(jwkPublicKey);
        const jwtPayload = jwt.verify(token, pem, {
            algorithms: ['RS256'],
        }) as IJwtUserPayload;
        return jwtPayload;
    } catch (err) {
        throw new HttpErrorResponse(ERROR_MESSAGES.INVALID_ACCESS_TOKEN, 401, ERROR_CODES.AUTHORIZATION_ERROR);
    }
};

const getBearerTokenFromApiRequest = (httpHeaders: IncomingHttpHeaders): string | undefined => {
    const bearer = httpHeaders.authorization;
    if (!bearer) return;

    const token = bearer.split(/\s/)?.[1];
    return token;
};

export { getBearerTokenFromApiRequest, verfiyAccessToken };
