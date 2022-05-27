import { Document } from 'dynamoose/dist/Document';
import { ObjectType } from 'dynamoose/dist/General';

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
    nextSearchStartFromKey?: ObjectType;
    count: number;
}

export interface HttpResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: HttpResponseError;
    pagination?: HttpResponsePagination;
    dDBPagination?: HttpDynamoDBResponsePagination;
}
