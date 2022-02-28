import { ClientSession } from 'mongoose';
import { v4 } from 'uuid';
import Connection, { IConnection } from '../../models/connection';

import Follow, { IFollow } from '../../models/follow';
import User from '../../models/user';

const createFollowTransaction = (followerId: string, followeeId: string) => {
    const follow: IFollow = {
        id: v4(),
        followerId: followerId,
        followeeId: followeeId,
    };

    return Follow.transaction.create(follow);
};

const deleteFollowTransaction = (followId: string) => {
    return Follow.transaction.delete({ id: followId });
};
//inputs: session form controller, userId ,isFollower
const incrementUserFollowResourceCountTransaction = async (
    userId: string,
    isFollower: boolean,
    session: ClientSession
) => {
    const userFollowResourceCount = isFollower ? 'followeeCount' : 'followerCount';
    const userFollowResourceCountTransactionItem = User.updateOne(
        { id: userId },
        { $ADD: { [userFollowResourceCount]: +1 } },
        { session: session }
    );
    return userFollowResourceCountTransactionItem;
};
//inputs: session form controller, userId ,isFollower
const decrementUserFollowResourceCountTransaction = async (
    userId: string,
    isFollower: boolean,
    session: ClientSession
) => {
    const userFollowResourceCount = isFollower ? 'followeeCount' : 'followerCount';
    const userFollowResourceCountTransactionItem = User.updateOne(
        { id: userId },
        { $ADD: { [userFollowResourceCount]: -1 } },
        { session: session }
    );
    return userFollowResourceCountTransactionItem;
};

const createConnectionTransaction = (connectorId: string, connecteeId: string, connectionInitiatedBy: string) => {
    const connection: IConnection = {
        id: v4(),
        connectorId: connectorId,
        connecteeId: connecteeId,
        connectionInitiatedBy: connectionInitiatedBy,
        isConnected: false,
    };
    return Connection.transaction.create(connection);
};

const deleteConnectionTransaction = (connectionId: string) => {
    return Connection.transaction.delete({ id: connectionId });
};

const createUserConnectionTransaction = (connectorId: string, connecteeId: string, isConnectionInitiator: boolean) => {
    const createConnetionTransactionItem = createConnectionTransaction(
        connectorId,
        connecteeId,
        isConnectionInitiator ? connectorId : connecteeId
    );
    return createConnetionTransactionItem;
};

const confirmConnectionTransaction = async (connectionId: string, connectedAt: number) => {
    return await Connection.transaction.update({ id: connectionId }, { isConnected: true, connectedAt: connectedAt });
};

// const incrementUserConnectionCountTransaction = async (userId: string) => {
//     return await User.transaction.update({ id: userId }, { $ADD: { connectionCount: +1 } });
// };

// const decrementUserConnectionCountTransaction = async (userId: string) => {
//     return await User.transaction.update({ id: userId }, { $ADD: { connectionCount: -1 } });
// };

const DBTransactions = {
    createFollowTransaction,
    deleteFollowTransaction,
    incrementUserFollowResourceCountTransaction,
    decrementUserFollowResourceCountTransaction,

    createUserConnectionTransaction,
    deleteConnectionTransaction,
    confirmConnectionTransaction,
    // incrementUserConnectionCountTransaction,
    // decrementUserConnectionCountTransaction,
};

export default DBTransactions;
