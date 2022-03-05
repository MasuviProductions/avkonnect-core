import { v4 } from 'uuid';
import Connection, { IConnection } from '../../models/connection';

import Follow, { IFollow } from '../../models/follow';

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

const DBTransactions = {
    createFollowTransaction,
    deleteFollowTransaction,
    createUserConnectionTransaction,
    deleteConnectionTransaction,
    confirmConnectionTransaction,
};

export default DBTransactions;
