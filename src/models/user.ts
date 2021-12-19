import * as dynamoose from 'dynamoose';
import { ValueType } from 'dynamoose/dist/Schema';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';

const validateIfNumberIsEpoch = (val: ValueType) => typeof val === 'number' && !!new Date(val);

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
    connectedAt: { type: Number, validate: validateIfNumberIsEpoch },
});

export interface IUserSkill {
    skill: string;
    endorsers?: string[];
}
const UserSkillSchema = new dynamoose.Schema({
    skill: { type: String },
    endorsers: { type: Array, schema: Array.of(String) },
});

export interface IUserExperience {
    company: string;
    isPresentlyWorking: boolean;
    description: string;
    employmentType: string;
    endDate: number;
    location: string;
    startDate: number;
    title: string;
}
const UserExperienceSchema = new dynamoose.Schema({
    company: { type: String },
    isPresentlyWorking: { type: Boolean },
    description: { type: String },
    employmentType: { type: String },
    endDate: { type: Number, validate: validateIfNumberIsEpoch },
    location: { type: String },
    startDate: { type: Number, validate: validateIfNumberIsEpoch },
    title: { type: String },
});

export interface IUserConnections {
    isPrivate: boolean;
}
const UserPreferenceConnectionsScehma = new dynamoose.Schema({
    isPrivate: { type: Boolean },
});

export interface IUserPreference {
    connections: IUserConnections;
}
const UserPreferenceSchema = new dynamoose.Schema({
    connections: { type: Object, schema: UserPreferenceConnectionsScehma },
});

export interface IUser {
    id: string;
    aboutUser: string;
    backgroundImageUrl: string;
    connections: Array<IUserConnection>;
    currentPosition: string;
    dateOfBirth: number;
    displayPictureUrl: string;
    email: string;
    experiences: Array<IUserExperience>;
    followers: Array<string>;
    following: Array<string>;
    headline: string;
    name: string;
    phone: string;
    preferences: IUserPreference;
    skills: Array<IUserSkill>;
}
// Changes in UserSchemaObj must be updated in IUser
const UserSchema = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        aboutUser: { type: String },
        backgroundImageUrl: { type: String },
        connections: { type: Array, schema: Array.of(UserConnectionScheme) },
        currentPosition: { type: String },
        dateOfBirth: { type: Number, validate: validateIfNumberIsEpoch },
        displayPictureUrl: { type: String },
        email: { type: String },
        experieces: { type: Array, schema: Array.of(UserExperienceSchema) },
        followers: { type: Array, schema: Array.of(String) },
        following: { type: Array, schema: Array.of(String) },
        headline: { type: String },
        name: { type: String },
        phone: { type: String },
        preferences: { type: Object, schema: UserPreferenceSchema },
        skills: { type: Array, schema: Array.of(UserSkillSchema) },
    },
    {
        timestamps: true,
    }
);
const User = dynamoose.model<IDynamooseDocument<IUser>>(TABLE.Users, UserSchema);

export const READABLE_USER_PROPERTIES = [
    'id',
    'email',
    'followers',
    'following',
    'connections',
    'createdAt',
    'updatedAt',
] as const;

export type IEditableUser = Partial<Omit<IUser, typeof READABLE_USER_PROPERTIES[number]>>;

export default User;
