import { v4 } from 'uuid';
import { IMinifiedUser } from '../../interfaces/api';
import { ICognitoUserInfoApiResponse } from '../../interfaces/jwt';
import { IUser, IUserConnection, IUserExperience, IUserSkill } from '../../models/user';

export const getNewUserModelFromJWTUserPayload = (jwtUserPayload: ICognitoUserInfoApiResponse): IUser => {
    return {
        id: v4(),
        connections: new Array<IUserConnection>(),
        currentPosition: '',
        dateOfBirth: 0,
        displayPictureUrl: '',
        experiences: Array<IUserExperience>(),
        email: jwtUserPayload.email,
        followers: new Array<string>(),
        following: new Array<string>(),
        headline: '',
        name: jwtUserPayload.name,
        phone: '',
        preferences: { connections: { isPrivate: false } },
        skills: Array<IUserSkill>(),
    };
};

export const getMinifiedUser = (user: IUser): IMinifiedUser | undefined => {
    if (!user) {
        return;
    }
    const minifiedUser: IMinifiedUser = {
        id: user.id,
        dateOfBirth: user.dateOfBirth,
        displayPictureUrl: user.displayPictureUrl,
        email: user.email,
        name: user.name,
    };
    return minifiedUser;
};
