import * as dynamoose from 'dynamoose';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';

export interface IFeedback {
    id: string;
    userId: string;
    subject: string;
    description: string;
    feedbackType: string;
}

const FeedbackSchema = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        userId: { type: String },
        subject: { type: String },
        description: { type: String },
        feedbackType: { type: String },
    },
    {
        timestamps: true,
    }
);
const Feedback = dynamoose.model<IDynamooseDocument<IFeedback>>(TABLE.Feedbacks, FeedbackSchema);

export default Feedback;
