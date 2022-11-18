import * as dynamoose from 'dynamoose';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';

interface IUserSettingsDisplay {
    theme: string;
}

const UserSettingsDisplay = new dynamoose.Schema({
    theme: { type: String },
});

export type IUserSettingsPrivacyOption = 'public' | 'connectionsOnly' | 'private';

export interface IUserSettingsPrivacy {
    location: IUserSettingsPrivacyOption;
    dateOfBirth: IUserSettingsPrivacyOption;
    gender: IUserSettingsPrivacyOption;
    profilePhotos: IUserSettingsPrivacyOption;
    email: IUserSettingsPrivacyOption;
    phone: IUserSettingsPrivacyOption;
}

const UserSettingsPrivacy = new dynamoose.Schema({
    location: { type: String },
    dateOfBirth: { type: String },
    gender: { type: String },
    profilePhotos: { type: String },
    email: { type: String },
    phone: { type: String },
});

export interface IUserSettingsCommunications {
    connectionInvite: 'all' | 'emailPrompt' | 'phonePrompt' | 'messagePrompt';
}

const UserSettingsCommunications = new dynamoose.Schema({
    connectionInvite: { type: String },
});

export interface IUserSettingsVisibility {
    activeStatus: IUserSettingsPrivacyOption;
    userBlockingInfo: Array<string>;
}

const UserSettingsVisibility = new dynamoose.Schema({
    activeStatus: { type: String },
    userBlockingInfo: { type: Array, schema: Array.of(String) },
});

export interface IUserFeedPreferences {
    recentOnly: boolean;
    favourites: Array<string>;
}

const UserFeedPreferences = new dynamoose.Schema({
    favourites: { type: Array, schema: Array.of(String) },
    recentOnly: { type: Boolean },
});

export interface IUserSettings {
    id: string;
    display: IUserSettingsDisplay;
    privacy: IUserSettingsPrivacy;
    visibility: IUserSettingsVisibility;
    communications: IUserSettingsCommunications;
    feedPreference: IUserFeedPreferences;
}

const UserSettingsSchema = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        display: { type: Object, schema: UserSettingsDisplay },
        privacy: { type: Object, schema: UserSettingsPrivacy },
        visibility: { type: Object, schema: UserSettingsVisibility },
        communications: { type: Object, schema: UserSettingsCommunications },
        feedPreference: { type: Object, schema: UserFeedPreferences },
    },
    {
        timestamps: true,
    }
);

const Settings = dynamoose.model<IDynamooseDocument<IUserSettings>>(TABLE.SETTINGS, UserSettingsSchema);

export default Settings;

export const READABLE_USER_PROPERTIES = ['id'] as const;

export type IEditableUserSettings = Pick<
    IUserSettings,
    'display' | 'privacy' | 'visibility' | 'communications' | 'feedPreference'
>;
