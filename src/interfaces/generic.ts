import { Document } from 'dynamoose/dist/Document';

export type IDynamooseDocument<T> = T & Document;
