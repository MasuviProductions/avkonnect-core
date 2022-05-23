import { IUser } from '../models/user';

export type IMinifiedUser = Readonly<Pick<IUser, 'id' | 'name' | 'dateOfBirth' | 'email' | 'displayPictureUrl'>>;

export type IAuthUser = Readonly<Pick<IUser, 'id' | 'email'>>;

export type IUserAvatar = Pick<
    IUser,
    'id' | 'name' | 'email' | 'displayPictureUrl' | 'headline' | 'backgroundImageUrl'
>;

export type IConnectionActivityType = 'connectionRequest' | 'connectionConfirmation';

export type IActivityType = IConnectionActivityType;

export interface INotificationActivity {
    resourceId: string;
    activityType: IActivityType;
}

export type IConnectionType = 'connected' | 'pending' | 'all' | 'sent';
