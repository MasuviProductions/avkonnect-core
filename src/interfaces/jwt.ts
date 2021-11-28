export interface IJWTHeader {
    kid: string;
    alg: 'RS256';
}
export interface IJWTDecoded {
    header: IJWTHeader;
    body: unknown;
}

export interface ICognitoUserInfoApiResponse {
    sub: string;
    address: string;
    birthdate: string;
    email_verified: boolean;
    gender: string;
    name: string;
    phone_number_verified: boolean;
    phone_number: string;
    email: string;
    username: string;
}

export interface ICognitoAccessTokenPayload {
    origin_jti: string;
    sub: string;
    token_use: string;
    scope: string;
    auth_time: number;
    iss: string;
    exp: number;
    iat: number;
    version: number;
    jti: string;
    client_id: string;
    username: string;
}

export interface ICognitoUserPoolJWKKey {
    alg: 'RS256';
    e: 'AQAB';
    kid: string;
    kty: 'RSA';
    n: string;
    use: string;
}
export interface ICognitoUserPoolJWKsApiResponse {
    keys: ICognitoUserPoolJWKKey[];
}
