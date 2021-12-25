import { v4 } from 'uuid';
import { IMinifiedUser } from '../../interfaces/api';
import { ICognitoUserInfoApiResponse } from '../../interfaces/jwt';
import { IUser, IUserExperience, IUserSkill } from '../../models/user';

export const getNewUserModelFromJWTUserPayload = (jwtUserPayload: ICognitoUserInfoApiResponse): IUser => {
    return {
        id: v4(),
        aboutUser: '',
        backgroundImageUrl: '',
        connectionCount: 0,
        currentPosition: '',
        dateOfBirth: 0,
        displayPictureUrl: '',
        experiences: Array<IUserExperience>(),
        email: jwtUserPayload.email,
        followerCount: 0,
        followeeCount: 0,
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

export type IFollowResourceValues = 'followerId' | 'followeeId';

export const getFollowQueryAndAttributeFields = (
    isFollower: boolean
): { queryField: IFollowResourceValues; attributeField: IFollowResourceValues } => {
    const queryField: IFollowResourceValues = isFollower ? 'followerId' : 'followeeId';
    const attributeField: IFollowResourceValues = isFollower ? 'followeeId' : 'followerId';
    return { queryField, attributeField };
};
