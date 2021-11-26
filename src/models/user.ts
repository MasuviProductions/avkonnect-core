import * as dynamoose from 'dynamoose';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';

export interface IUser {
    id: string;
    connectionIds: string[];
    dateOfBirth: string;
    displayPicture?: string;
    email: string;
    followerIds: string[];
    followingIds: string[];
    preferences?: unknown;
}

// Changes in UserSchemaObj must be updated in IUser
const UserSchemaObj = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        connectionIds: { type: Array },
        dateOfBirth: { type: String },
        displayPicture: { type: String },
        email: { type: String, rangeKey: true },
        followerIds: { type: Array },
        followingIds: { type: Array },
        preferences: { type: Object },
    },
    {
        timestamps: true,
    }
);

const User = dynamoose.model<IDynamooseDocument<IUser>>(TABLE.Users, UserSchemaObj);

export default User;
