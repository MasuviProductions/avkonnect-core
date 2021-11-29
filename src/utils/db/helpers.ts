import { ICognitoUserInfoApiResponse } from '../../interfaces/jwt';
import { IUser } from '../../models/user';

export const getNewUserModelFromJWTUserPayload = (jwtUserPayload: ICognitoUserInfoApiResponse): IUser => {
    return {
        id: jwtUserPayload.sub,
        connectionIds: new Array<string>(),
        email: jwtUserPayload.email,
        followerIds: new Array<string>(),
        followingIds: new Array<string>(),
        name: jwtUserPayload.name,
    };
};
