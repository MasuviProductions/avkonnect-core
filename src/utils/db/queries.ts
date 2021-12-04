import { UpdateTransactionInput } from 'dynamoose/dist/Transaction';
import { ERROR_CODES, ERROR_MESSAGES } from '../../constants/errors';
import User, { IUser } from '../../models/user';
import { HttpError } from '../error';

const getUserByEmail = async (email: string): Promise<IUser> => {
    const userDocuments = await User.scan({
        email: email,
    }).exec();
    if (!userDocuments?.[0]) {
        throw new HttpError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, 400, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    return userDocuments[0];
};

const getUserById = async (id: string): Promise<IUser> => {
    const userDocument = await User.get({
        id: id,
    });
    return userDocument;
};

export type IFollowResourceType = 'following' | 'followers';

const getUserFollowResource = async (
    userId: string,
    followResourceType: IFollowResourceType
): Promise<Array<string>> => {
    const user = await getUserById(userId);
    return user[followResourceType];
};

const updateUserFollowResourceTransaction = async (
    userId: string,
    followResourceId: string,
    followResourceType: IFollowResourceType
): Promise<UpdateTransactionInput> => {
    const followResources = await getUserFollowResource(userId, followResourceType);
    if (followResources.includes(followResourceId)) {
        throw new HttpError(ERROR_MESSAGES.USER_ALREADY_FOLLOWING, 400, ERROR_CODES.REDUNDANT_ERROR);
    }

    return User.transaction.update({ id: userId }, { [followResourceType]: [...followResources, followResourceId] });
};

const deleteUserFollowResourceTransaction = async (
    userId: string,
    followResourceId: string,
    followResourceType: IFollowResourceType
): Promise<UpdateTransactionInput> => {
    const followResources = await getUserFollowResource(userId, followResourceType);
    if (!followResources.includes(followResourceId)) {
        throw new HttpError(ERROR_MESSAGES.USER_NOT_FOLLOWING, 400, ERROR_CODES.REDUNDANT_ERROR);
    }

    return await User.transaction.update(
        { id: userId },
        {
            [followResourceType]: followResources.filter(
                (userFollowResourceId) => userFollowResourceId != followResourceId
            ),
        }
    );
};

const createUser = async (user: IUser): Promise<IUser> => {
    const myUser = new User(user);
    await myUser.save();
    return user;
};

export const DBQueries = {
    createUser,
    getUserByEmail,
    getUserById,
    updateUserFollowResourceTransaction,
    deleteUserFollowResourceTransaction,
};
