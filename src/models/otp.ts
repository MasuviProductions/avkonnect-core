import * as dynamoose from 'dynamoose';
import { IDynamooseDocument } from '../interfaces/generic';
import { TABLE } from '../constants/db';
export interface IOtp {
    phone: number;
    otp: number;
    time: number;
}
const OtpSchema = new dynamoose.Schema(
    {
        phone: { type: Number },
        otp: { type: Number },
        time: { type: Date },
    },
    {
        timestamps: true,
    }
);
export default dynamoose.model<IDynamooseDocument<IOtp>>(TABLE.OTP, OtpSchema);
