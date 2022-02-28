// import { v4 } from 'uuid';
import mongoose, { Schema } from 'mongoose';
import { TABLE } from '../constants/db';

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
const UserExperienceSchema: Schema = new Schema({
    company: { type: String },
    isPresentlyWorking: { type: Boolean },
    description: { type: String },
    employmentType: { type: String },
    endDate: { type: Date },
    location: { type: String },
    startDate: { type: Date },
    title: { type: String },
});

export interface IUserConnections {
    isPrivate: boolean;
}
const UserPreferenceConnectionsScehma = new Schema({
    isPrivate: { type: Boolean },
});

export interface IUserPreference {
    connections: IUserConnections;
}
const UserPreferenceSchema = new Schema({
    connections: { type: Object, schema: UserPreferenceConnectionsScehma },
});

export interface IUserSearchFields {
    name: string;
}
const UserSearchfieldsSchema = new Schema({
    name: { type: String },
});

export interface IUser {
    // _id: string;
    id: string;
    aboutUser: string;
    backgroundImageUrl: string;
    connectionCount: number;
    currentPosition: string;
    dateOfBirth: number;
    displayPictureUrl: string;
    email: string;
    experiences: Array<IUserExperience>;
    followerCount: number;
    followeeCount: number;
    headline: string;
    name: string;
    phone: string;
    gender: string;
    location: string;
    preferences: IUserPreference;
    projectsRefId: string;
    experiencesRefId: string;
    searchFields: IUserSearchFields;
    skillsRefId: string;
    certificationsRefId: string;
}
// Changes in UserSchemaObj must be updated in IUser
const UserSchema = new Schema(
    {
        // _id: new mongoose.Types.ObjectId(),
        id: { type: String, hashKey: true },
        aboutUser: { type: String },
        backgroundImageUrl: { type: String },
        connectionCount: { type: Number },
        currentPosition: { type: String },
        dateOfBirth: { type: Date },
        displayPictureUrl: { type: String },
        email: { type: String },
        experieces: { type: Array, schema: Array.of(UserExperienceSchema) },
        followerCount: { type: Number },
        followeeCount: { type: Number },
        headline: { type: String },
        name: { type: String },
        phone: { type: String },
        gender: { type: String },
        location: { type: String },
        projectsRefId: { type: String },
        experiencesRefId: { type: String },
        preferences: { type: Object, schema: UserPreferenceSchema },
        searchFields: { type: Object, schema: UserSearchfieldsSchema },
        skillsRefId: { type: String },
        certificationsRefId: { type: String },
    },
    {
        timestamps: true,
    }
);
export default mongoose.model<IUser>(TABLE.USERS, UserSchema);

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

// export interface IComment extends Document {
//     // _id: string;
//     userId: string;
//     message: string;
// }

// const CommentSchema: Schema = new Schema(
//     {
//         // _id: new mongoose.Types.ObjectId(),
//         userId: { type: String },
//         message: { type: String },
//     },
//     {
//         timestamps: true,
//     }
// );

// export default mongoose.model<IComment>('Comment', CommentSchema);
