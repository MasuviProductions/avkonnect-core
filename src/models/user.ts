import * as dynamoose from 'dynamoose';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';

export interface IUserRef {
    id: string;
    email: string;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UserRefSchema = new dynamoose.Schema({
    id: { type: String },
    email: { type: String },
});

export interface IUserSkill {
    skill: string;
    endorserIds: string[];
}
const UserSkillSchema = new dynamoose.Schema({
    skill: { type: String },
    endorsers: { type: Array, schema: Array.of(String) },
});

export interface IUserExperience {
    company?: string;
    currentlyWorking: boolean;
    description?: string;
    employmentType?: string;
    endDate: number;
    location?: string;
    startDate: number;
    title: string;
}
const UserExperienceSchema = new dynamoose.Schema({
    company: { type: String },
    currentlyWorking: { type: Boolean },
    description: { type: String },
    employmentType: { type: String },
    endDate: { type: Date },
    location: { type: String },
    startDate: { type: Date },
    title: { type: String },
});

export interface IUser {
    id: string;
    connections: string[];
    currentPosition?: string;
    dateOfBirth?: string;
    displayPicture?: string;
    email: string;
    experiences?: IUserExperience[];
    followers: string[];
    following: string[];
    headline?: string;
    name: string;
    phone?: string;
    preferences?: unknown;
    skills?: IUserSkill[];
}
// Changes in UserSchemaObj must be updated in IUser
const UserSchema = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        connections: { type: Array, schema: Array.of(String) },
        currentPosition: { type: String },
        dateOfBirth: { type: String },
        displayPicture: { type: String },
        email: { type: String },
        experieces: { type: Array, schema: Array.of(UserExperienceSchema) },
        followers: { type: Array, schema: Array.of(String) },
        following: { type: Array, schema: Array.of(String) },
        headline: { type: String },
        name: { type: String },
        phone: { type: String },
        preferences: { type: Object },
        skills: { type: Array, schema: Array.of(UserSkillSchema) },
    },
    {
        timestamps: true,
    }
);
const User = dynamoose.model<IDynamooseDocument<IUser>>(TABLE.Users, UserSchema);

export default User;
