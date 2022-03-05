import { Document } from 'dynamoose/dist/Document';

export type IDynamooseDocument<T> = T & Document;

export interface HttpResponseError {
    message: string;
    code: string;
}

export interface HttpResponsePagination {
    totalCount: number;
    totalPages: number;
    page: number;
    count: number;
}

export interface HttpDynamoDBResponsePagination {
    nextSearchStartFromId?: string;
    count: number;
}

export interface HttpResponse {
    success: boolean;
    data?: unknown;
    error?: HttpResponseError;
    pagination?: HttpResponsePagination;
    dDBPagination?: HttpDynamoDBResponsePagination;
}
