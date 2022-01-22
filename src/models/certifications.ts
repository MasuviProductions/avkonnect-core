import * as dynamoose from 'dynamoose';
import { ValueType } from 'dynamoose/dist/Schema';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';

const validateIfNumberIsEpoch = (val: ValueType) => typeof val === 'number' && !!new Date(val);

export interface ICertification {
    name: string;
    issuerName: string;
    description: string;
    issuedAt: number;
    expiresAt: number;
    industry: string;
    photoUrl: string;
    link: string;
}

const CertificationSchema = new dynamoose.Schema({
    name: { type: String },
    issuerName: { type: String },
    description: { type: String },
    issuedAt: { type: Number, validate: validateIfNumberIsEpoch },
    expiresAt: { type: Number, validate: validateIfNumberIsEpoch },
    industry: { type: String },
    photoUrl: { type: String },
    link: { type: String },
});
export interface ICertifications {
    id: string;
    certifications: Array<ICertification>;
}

const CertificationsSchema = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        certifications: { type: Array, schema: Array.of(CertificationSchema) },
    },
    {
        timestamps: true,
    }
);
const Certifications = dynamoose.model<IDynamooseDocument<ICertifications>>(TABLE.Certifications, CertificationsSchema);

export default Certifications;
