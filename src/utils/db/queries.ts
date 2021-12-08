import { UpdateTransactionInput } from 'dynamoose/dist/Transaction';
import { ERROR_CODES, ERROR_MESSAGES } from '../../constants/errors';
import User, { IEditableUser, IUser, IUserConnection } from '../../models/user';
import { HttpError } from '../error';

const getUserByEmail = async (email: string): Promise<IUser> => {
    const userDocuments = await User.scan({
        email: email,
    }).exec();
    return userDocuments[0];
};

const getUserById = async (id: string): Promise<IUser> => {
    const userDocument = await User.get({
        id: id,
    });
    return userDocument;
};

const createUser = async (user: IUser): Promise<IUser> => {
    const myUser = new User(user);
    await myUser.save();
    return user;
};

const updateUser = async (userId: string, user: IEditableUser): Promise<IUser> => {
    return await User.update({ id: userId }, { ...user });
};

export type IFollowResourceType = 'following' | 'followers';

const getUserFollowResource = async (
    userId: string,
    followResourceType: IFollowResourceType
): Promise<Array<string>> => {
    const user = await getUserById(userId);
    return user[followResourceType];
};

const getUserConnections = async (userId: string): Promise<Array<IUserConnection>> => {
    const user = await getUserById(userId);
    return user.connections;
};

const updateUserFollowResourceTransaction = async (
    userId: string,
    followResourceId: string,
    followResourceType: IFollowResourceType
): Promise<UpdateTransactionInput> => {
    const followResources = await getUserFollowResource(userId, followResourceType);
    for (let index = 0; index < followResources.length; index += 1) {
        if (followResources[index] === followResourceId) {
            followResources[index] = followResources[followResources.length - 1];
            followResources.pop();
            break;
        }
    }
    return User.transaction.update({ id: userId }, { [followResourceType]: [...followResources, followResourceId] });
};

const deleteUserFollowResourceTransaction = async (
    userId: string,
    followResourceId: string,
    followResourceType: IFollowResourceType
): Promise<UpdateTransactionInput> => {
    const followResources = await getUserFollowResource(userId, followResourceType);
    return await User.transaction.update(
        { id: userId },
        {
            [followResourceType]: followResources.filter(
                (userFollowResourceId) => userFollowResourceId != followResourceId
            ),
        }
    );
};

const createUserConnectionTransaction = async (
    userId: string,
    connectionId: string,
    isInitiatedByUser: boolean
): Promise<UpdateTransactionInput> => {
    const userConnections = await getUserConnections(userId);
    userConnections.forEach((connection) => {
        if (connection.id === connectionId) {
            if (connection.isInitiatedByUser && connection.isConnected) {
                throw new HttpError(ERROR_MESSAGES.USER_CONNECTED, 400, ERROR_CODES.REDUNDANT_ERROR);
            } else {
                throw new HttpError(ERROR_MESSAGES.USER_CONNECTION_REQUEST, 400, ERROR_CODES.REDUNDANT_ERROR);
            }
        }
    });
    const newConnection: IUserConnection = {
        id: connectionId,
        isConnected: false,
        isInitiatedByUser: isInitiatedByUser,
    };
    return await User.transaction.update({ id: userId }, { connections: [...userConnections, newConnection] });
};

const confirmUserConnectionTransaction = async (
    userId: string,
    connectionId: string,
    connectedAt: number,
    openAccessToConnect = false
): Promise<UpdateTransactionInput> => {
    const userConnections = await getUserConnections(userId);
    let isConnectionRequestPresent = false;
    for (let index = 0; index < userConnections.length; index += 1) {
        const userConnection = userConnections[index];
        if (userConnection.id === connectionId) {
            isConnectionRequestPresent = true;
            if (!userConnection.isConnected) {
                if (openAccessToConnect || !userConnection.isInitiatedByUser) {
                    userConnection.isConnected = true;
                    userConnection.connectedAt = connectedAt;
                    break;
                } else {
                    throw new HttpError(ERROR_MESSAGES.USER_CANNOT_CONFIRM, 403, ERROR_CODES.AUTHORIZATION_ERROR);
                }
            } else {
                throw new HttpError(ERROR_MESSAGES.USER_CONNECTED, 400, ERROR_CODES.REDUNDANT_ERROR);
            }
        }
    }
    if (!isConnectionRequestPresent) {
        throw new HttpError(ERROR_MESSAGES.USER_NO_CONNECTION_REQUEST, 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }
    return await User.transaction.update({ id: userId }, { connections: userConnections });
};

const deleteUserConnectionTransaction = async (
    userId: string,
    connectionId: string
): Promise<UpdateTransactionInput> => {
    const userConnections = await getUserConnections(userId);
    let isConnectionRequestPresent = false;
    for (let index = 0; index < userConnections.length; index += 1) {
        let userConnection = userConnections[index];
        if (userConnection.id === connectionId) {
            isConnectionRequestPresent = true;
            userConnection = userConnections[userConnections.length - 1];
            userConnections.pop();
            break;
        }
    }
    if (!isConnectionRequestPresent) {
        throw new HttpError(ERROR_MESSAGES.USER_NOT_CONNECTED, 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }
    return await User.transaction.update({ id: userId }, { connections: userConnections });
};

export const DBQueries = {
    createUserConnectionTransaction,
    confirmUserConnectionTransaction,
    deleteUserConnectionTransaction,
    createUser,
    getUserByEmail,
    getUserById,
    updateUser,
    updateUserFollowResourceTransaction,
    deleteUserFollowResourceTransaction,
};
