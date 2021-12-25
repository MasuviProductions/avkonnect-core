import * as dynamoose from 'dynamoose';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';

export interface IFollow {
    id: string;
    followerId: string;
    followeeId: string;
}
// Changes in FollowSchemaObj must be updated in IFollow
const FollowSchema = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        followerId: { type: String },
        followeeId: { type: String },
    },
    {
        timestamps: true,
    }
);
const Follow = dynamoose.model<IDynamooseDocument<IFollow>>(TABLE.Follows, FollowSchema);

export default Follow;
