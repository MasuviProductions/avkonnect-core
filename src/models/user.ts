import mongoose, { Schema } from 'mongoose';
import { TABLE } from '../constants/db';

export interface IUserConnections {
    isPrivate: boolean;
}
const UserPreferenceConnectionsScehma = new Schema<IUserConnections>({
    isPrivate: { type: Boolean },
});

export interface IUserPreference {
    connections: IUserConnections;
}

export interface IUserRole {
    role: 'user' | 'admin';
}

const UserRoleSchema = new Schema<IUserRole>({
    role: { type: String },
});

const UserPreferenceSchema = new Schema<IUserPreference>({
    connections: { type: Object, schema: UserPreferenceConnectionsScehma },
});

export interface IUserSearchFields {
    name: string;
}
const UserSearchfieldsSchema = new Schema<IUserSearchFields>({
    name: { type: String },
});

export interface IUser {
    id: string;
    role: IUserRole;
    aboutUser: string;
    backgroundImageUrl: string;
    connectionCount: number;
    currentPosition: string;
    dateOfBirth?: Date;
    displayPictureUrl: string;
    email: string;
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
    unseenNotificationsCount?: number;
    settingsRefId: string;
}
const UserSchema = new Schema<IUser>(
    {
        id: { type: String, hashKey: true },
        aboutUser: { type: String },
        role: { type: Object, schema: UserRoleSchema },
        backgroundImageUrl: { type: String },
        connectionCount: { type: Number },
        currentPosition: { type: String },
        dateOfBirth: { type: Date },
        displayPictureUrl: { type: String },
        email: { type: String },
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
        settingsRefId: { type: String },
    },
    {
        timestamps: true,
    }
);
UserSchema.add({ unseenNotificationsCount: { type: Number } });

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

export type IEditableUser = Pick<
    IUser,
    | 'aboutUser'
    | 'backgroundImageUrl'
    | 'currentPosition'
    | 'dateOfBirth'
    | 'displayPictureUrl'
    | 'email'
    | 'gender'
    | 'headline'
    | 'location'
    | 'name'
    | 'phone'
    | 'preferences'
    | 'unseenNotificationsCount'
>;
