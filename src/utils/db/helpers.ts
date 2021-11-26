import { IJwtUserPayload } from '../../interfaces/jwt';
import { IUser } from '../../models/user';

export const getNewUserModelFromJWTUserPayload = (jwtUserPayload: IJwtUserPayload): IUser => {
    return {
        id: jwtUserPayload.sub,
        connectionIds: new Array<string>(),
        dateOfBirth: jwtUserPayload.birthdate,
        email: jwtUserPayload.email,
        followerIds: new Array<string>(),
        followingIds: new Array<string>(),
    };
};
