import { IUser } from '../models/user';

export type IMinifiedUser = Readonly<Pick<IUser, 'id' | 'name' | 'dateOfBirth' | 'email' | 'displayPictureUrl'>>;
