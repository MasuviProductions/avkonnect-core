import * as dynamoose from 'dynamoose';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';

interface IUserSettingsDisplay {
    theme: string;
}

const UserSettingsDisplay = new dynamoose.Schema({
    theme: { type: String },
});

export type IUserSettingsConnectionOnlyOptionSelection = 'public' | 'connectionsOnly' | 'private';

export interface IUserSettingsPrivacy {
    location: IUserSettingsConnectionOnlyOptionSelection;
    dateOfBirth: IUserSettingsConnectionOnlyOptionSelection;
    gender: IUserSettingsConnectionOnlyOptionSelection;
    profilePhotos: IUserSettingsConnectionOnlyOptionSelection;
    email: IUserSettingsConnectionOnlyOptionSelection;
    phone: IUserSettingsConnectionOnlyOptionSelection;
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
    connectionInvite: 'all' | 'emailPrompt';
}

const UserSettingsCommunications = new dynamoose.Schema({
    connectionInvite: { type: String },
});

export interface IUserSettingsVisibility {
    activeStatus: IUserSettingsConnectionOnlyOptionSelection;
    userBlockingInfo: Array<string>;
}

const UserSettingsVisibility = new dynamoose.Schema({
    activeStatus: { type: String },
    userBlockingInfo: { type: Array, schema: Array.of(String) },
});

export interface IUserSettings {
    id: string;
    display: IUserSettingsDisplay;
    privacy: IUserSettingsPrivacy;
    visibility: IUserSettingsVisibility;
    communications: IUserSettingsCommunications;
}

const SettingsSchema = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        display: { type: Object, schema: UserSettingsDisplay },
        privacy: { type: Object, schema: UserSettingsPrivacy },
        visibility: { type: Object, schema: UserSettingsVisibility },
        communications: { type: Object, schema: UserSettingsCommunications },
    },
    {
        timestamps: true,
    }
);

const Settings = dynamoose.model<IDynamooseDocument<IUserSettings>>(TABLE.SETTINGS, SettingsSchema);

export default Settings;

export const READABLE_USER_PROPERTIES = ['id'] as const;

export type IEditableUserSettings = Pick<IUserSettings, 'display' | 'privacy' | 'visibility' | 'communications'>;
