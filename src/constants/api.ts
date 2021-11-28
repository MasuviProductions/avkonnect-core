import ENV from './env';

const APP_URL = {
    COGNITO_USER_INFO: `https://${ENV.AWS.COGNITO.CLIENT_DOMAIN}/oauth2/userInfo`,
    COGNITO_JWK: `${ENV.AWS.COGNITO.ISSUER_URL}/.well-known/jwks.json`,
};

export default APP_URL;
