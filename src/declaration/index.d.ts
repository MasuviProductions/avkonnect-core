import { IMinifiedUser } from '../interfaces/api';

declare module 'express' {
    interface Request {
        user?: Readonly<IMinifiedUser>;
    }
}
export = 'express';
