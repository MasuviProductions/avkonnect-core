import { IUser } from '../models/user';

export type IMinifiedUser = Readonly<Pick<IUser, 'id' | 'name' | 'dateOfBirth' | 'email' | 'displayPictureUrl'>>;

export type IAuthUser = Readonly<Pick<IUser, 'id' | 'email'>>;

export type IUserAvatar = Pick<
    IUser,
    'id' | 'name' | 'email' | 'displayPictureUrl' | 'headline' | 'backgroundImageUrl'
>;

export type ISourceType = 'user' | 'company';

export type IResourceType = 'post' | 'comment' | 'connection' | 'broadcast';

export type IConnectionActivity = 'connectionRequest' | 'connectionConfirmation';
export type IPostActivity = 'postReaction' | 'postComment' | 'postCreation';

export type IResourceActivity = IConnectionActivity | IPostActivity;
export interface INotificationActivity {
    resourceId: string;
    resourceType: IResourceType;
    resourceActivity: IResourceActivity;
    sourceId: string;
    sourceType: ISourceType;
}

export type IConnectionType = 'connected' | 'pending' | 'all' | 'sent';
