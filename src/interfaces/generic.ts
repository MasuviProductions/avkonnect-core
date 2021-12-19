import { Document } from 'dynamoose/dist/Document';

export type IDynamooseDocument<T> = T & Document;

export interface HttpResponseError {
    message: string;
    code: string;
}
export interface HttpResponse {
    success: boolean;
    data?: unknown;
    error?: HttpResponseError;
}
