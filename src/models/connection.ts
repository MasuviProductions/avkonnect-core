import * as dynamoose from 'dynamoose';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';
import { IUser } from './user';

export interface IConnection {
    id: string;
    connectorId: string;
    connecteeId: string;
    isConnected: boolean;
    connectedAt?: number;
    connectionInitiatedBy: string;
    connecteeInfo?: Partial<IUser>;
}
// Changes in ConnectionObj must be updated in IConnection
const ConnectionSchema = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        connectorId: { type: String },
        connecteeId: { type: String },
        isConnected: { type: Boolean },
        connectedAt: { type: Number },
        connectionInitiatedBy: { type: String },
    },
    {
        timestamps: true,
    }
);
const Connection = dynamoose.model<IDynamooseDocument<IConnection>>(TABLE.CONNECTIONS, ConnectionSchema);

export default Connection;
