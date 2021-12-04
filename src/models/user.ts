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

export interface IUserConnection {
    id: string;
    isConnected: boolean;
    isInitiatedByUser: boolean;
    connectedAt?: number;
}
const UserConnectionScheme = new dynamoose.Schema({
    id: { type: String },
    isConnected: { type: Boolean },
    isInitiatedByUser: { type: Boolean },
    connectedAt: { type: Date },
});

export interface IUserSkill {
    skill: string;
    endorsers: string[];
}
const UserSkillSchema = new dynamoose.Schema({
    skill: { type: String },
    endorsers: { type: Array, schema: Array.of(String) },
});

export interface IUserExperience {
    company: string;
    currentlyWorking: boolean;
    description: string;
    employmentType: string;
    endDate: number;
    location: string;
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
    connections: Array<IUserConnection>;
    currentPosition: string;
    dateOfBirth: number;
    displayPicture: string;
    email: string;
    experiences: Array<IUserExperience>;
    followers: Array<string>;
    following: Array<string>;
    headline: string;
    name: string;
    phone: string;
    preferences?: unknown;
    skills: Array<IUserSkill>;
}
// Changes in UserSchemaObj must be updated in IUser
const UserSchema = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        connections: { type: Array, schema: Array.of(UserConnectionScheme) },
        currentPosition: { type: String },
        dateOfBirth: { type: Date },
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

export const READABLE_USER_PROPERTIES = ['id', 'email', 'followers', 'following', 'connections'] as const;

export type IEditableUser = Partial<Omit<IUser, typeof READABLE_USER_PROPERTIES[number]>>;

export default User;
