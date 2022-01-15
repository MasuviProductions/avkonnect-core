import * as dynamoose from 'dynamoose';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';

export interface IExperience {
    companyName: string;
    description: string;
    employmentType: string;
    endDate: number;
    industry: string;
    role: string;
    startDate: number;
}
const ExperienceSchema = new dynamoose.Schema({
    companyName: { type: String },
    description: { type: String },
    employmentType: { type: String }, //TODO:declare enum
    endDate: { type: Number },
    industry: { type: String }, //TODO:declare enum
    role: { type: String },
    startDate: { type: Number },
});
export interface IExperiences {
    id: string;
    experiences: Array<IExperience>;
}
// Changes in ExperiencesSchema must be updated in IExperiences
const ExperiencesSchema = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        experiences: { type: Array, schema: Array.of(ExperienceSchema) },
    },
    {
        timestamps: true,
    }
);
const Experiences = dynamoose.model<IDynamooseDocument<IExperiences>>(TABLE.Experiences, ExperiencesSchema);

export default Experiences;
