export const ERROR_CODES = {
    AUTHENTICATION_ERROR: 'authentication_error',
    AUTHORIZATION_ERROR: 'authorization_error',
    CRITICAL_ERROR: 'critical_error',
    INVALID_ERROR: 'invalid',
    MISSING_FIELD: 'missing_field',
    NOT_FOUND_ERROR: 'not_found',
    RESOURCE_NOT_FOUND: 'resource_not_found',
    UNKNOWN_ERROR: 'unknown_error',
    THIRD_PARTY_ERROR: 'third_party_error',
    REDUNDANT_ERROR: 'action_redundant',
};

export const ERROR_MESSAGES = {
    ACTION_INVALID: 'Action is invalid',
    FORBIDDEN_ACCESS: 'Forbidden Access',
    INCORRECT_UNAME_PASS: 'Incorrect Username or Password',
    INVALID_ACCESS_TOKEN: 'Access token is not valid',
    MISSING_ACCESS_TOKEN: 'Access token is missing in Header',
    MISSING_UPDATE_ACTIONS: "'updateActions' is missing in request body",
    PERMISSION: 'You do not have the required permission to perform this operation',
    RESOURCE_NOT_FOUND: 'The resource for key is not found',
    COGNITO_USER_ERROR: 'Something went wrong while fetching userInfo from accessToken',
    COGNITO_JWKS_ERROR: 'Something went wrong while fetching JWKs',
    USER_ALREADY_FOLLOWING: 'User is already following them',
    USER_NOT_FOLLOWING: 'User is not following them',
};
