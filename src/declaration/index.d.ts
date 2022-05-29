import { IAuthUser } from '../interfaces/api';

declare module 'express' {
    interface Request {
        authUser?: Readonly<IAuthUser>;
        isUserToken?: boolean;
    }
}
export = 'express';
