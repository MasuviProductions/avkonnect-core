import { Document } from 'dynamoose/dist/Document';

export type IDynamooseDocument<T> = T & Document;

export interface HttpResponseError {
    message: string;
    code: string;
}

export interface HttpResponsePagination {
    total: number;
    page: number;
    count: number;
}

export interface HttpDDBResponsePagination {
    nextSearchStartFromId?: string;
    count: number;
}

export interface HttpResponse {
    success: boolean;
    data?: unknown;
    error?: HttpResponseError;
    pagination?: HttpResponsePagination;
    dDBPagination?: HttpDDBResponsePagination;
}
