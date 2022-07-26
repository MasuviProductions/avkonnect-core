import * as dynamoose from 'dynamoose';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';

export interface ISettings {
    id: string;
    dob: boolean;
    gender: boolean;
    location: boolean;
    theme: string;
}

const SettingsSchema = new dynamoose.Schema({
    id: { type: String, hashKey: true },
    dob: { type: Boolean },
    gender: { type: Boolean },
    location: { type: Boolean },
    theme: { type: String },
});

const Settings = dynamoose.model<IDynamooseDocument<ISettings>>(TABLE.SETTINGS, SettingsSchema);

export default Settings;

export const READABLE_USER_PROPERTIES = ['id'] as const;

export type IEditableSettings = Pick<ISettings, 'dob' | 'gender' | 'location' | 'theme'>;
