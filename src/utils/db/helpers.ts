import { Scan, Query as DynamooseQuery } from 'dynamoose/dist/DocumentRetriever';
import { ObjectType } from 'dynamoose/dist/General';
import { v4 } from 'uuid';
import { HttpDynamoDBResponsePagination, HttpResponsePagination } from '../../interfaces/generic';
import { IDynamooseDocument } from '../../interfaces/generic';
import { IMinifiedUser } from '../../interfaces/api';
import { ICognitoUserInfoApiResponse } from '@masuviproductions/avkonnect-auth/lib/interfaces/jwt';
import { IUser } from '../../models/user';
import DBQueries from './queries';
import { IProjects } from '../../models/projects';
import { ISkills } from '../../models/skills';
import { IExperiences } from '../../models/experience';
import { ICertifications } from '../../models/certifications';
import mongoose, { Document, Query } from 'mongoose';
import dynamoose from 'dynamoose';
import { HttpError } from '../error';
import { ERROR_CODES, ERROR_MESSAGES } from '../../constants/errors';
import Transaction from 'dynamoose/dist/Transaction';
import { IUserSettings } from '../../models/userSettings';

export const getNewUserModelFromJWTUserPayload = async (
    jwtUserPayload: ICognitoUserInfoApiResponse
): Promise<IUser> => {
    const newCertification: ICertifications = await DBQueries.createCertifications();
    const newExperience: IExperiences = await DBQueries.createExperiences();
    const newSkills: ISkills = await DBQueries.createSkills();
    const newProjects: IProjects = await DBQueries.createProjects();
    const newSettings: IUserSettings = await DBQueries.createSettings();
    const newUser: IUser = {
        id: v4(),
        aboutUser: '',
        backgroundImageUrl: '',
        connectionCount: 0,
        currentPosition: '',
        displayPictureUrl: '',
        email: jwtUserPayload.email,
        followerCount: 0,
        followeeCount: 0,
        headline: '',
        name: jwtUserPayload.name,
        phone: '',
        gender: '',
        location: '',
        preferences: { connections: { isPrivate: false } },
        projectsRefId: newProjects.id,
        searchFields: { name: jwtUserPayload.name.toLowerCase() },
        skillsRefId: newSkills.id,
        experiencesRefId: newExperience.id,
        certificationsRefId: newCertification.id,
        unseenNotificationsCount: 0,
        settingsRefId: newSettings.id,
    };
    return newUser;
};

export const getMinifiedUser = (user: IUser): IMinifiedUser | undefined => {
    if (!user) {
        return;
    }
    const minifiedUser: IMinifiedUser = {
        id: user.id,
        dateOfBirth: user.dateOfBirth,
        displayPictureUrl: user.displayPictureUrl,
        email: user.email,
        name: user.name,
    };
    return minifiedUser;
};

export type IFollowResourceValues = 'followerId' | 'followeeId';

export const getFollowQueryAndAttributeFields = (
    isFollower: boolean
): { queryField: IFollowResourceValues; attributeField: IFollowResourceValues } => {
    const queryField: IFollowResourceValues = isFollower ? 'followerId' : 'followeeId';
    const attributeField: IFollowResourceValues = isFollower ? 'followeeId' : 'followerId';
    return { queryField, attributeField };
};

const DYNAMODB_USER_SEARCH_SCAN_LIMIT = 15;

export const fetchDynamoDBPaginatedDocuments = async <T extends { id: string }>(
    initialQuery: Scan<IDynamooseDocument<T>> | DynamooseQuery<IDynamooseDocument<T>>,
    attributes: Array<string>,
    requestLimit: number,
    dDBAssistStartFromKeyFields: Array<keyof T>,
    dDBAssistStartFromKey?: ObjectType
): Promise<{
    documents: Partial<T>[];
    dDBPagination: HttpDynamoDBResponsePagination;
}> => {
    let startSearchFrom = dDBAssistStartFromKey;
    let documents: Array<Partial<T>> = [];
    do {
        const query = initialQuery;
        if (startSearchFrom) {
            query.startAt(startSearchFrom);
        }
        query.limit(DYNAMODB_USER_SEARCH_SCAN_LIMIT);
        if (attributes.length > 0) {
            query.attributes(attributes);
        }
        const searchedDocuments = await query.exec();

        startSearchFrom = searchedDocuments.lastKey;

        (searchedDocuments as Array<Partial<T>>).forEach((searchedDocument) => {
            documents.push(searchedDocument);
        });
    } while (documents.length < requestLimit && startSearchFrom);

    const nextSearchStartFromKey: ObjectType = {};

    if (startSearchFrom) {
        Object.entries(startSearchFrom).forEach(([key, value]) => {
            nextSearchStartFromKey[key] = value;
        });
    }

    if (requestLimit < documents.length) {
        documents = [...documents.slice(0, requestLimit)];
        dDBAssistStartFromKeyFields.forEach((key) => {
            nextSearchStartFromKey[key as string] = documents?.[documents.length - 1][key];
        });
    }
    const dDBPagination: HttpDynamoDBResponsePagination = {
        nextSearchStartFromKey: Object.keys(nextSearchStartFromKey).length > 0 ? nextSearchStartFromKey : undefined,
        count: documents.length,
    };
    return { documents, dDBPagination };
};

export const fetchMongoDBPaginatedDocuments = async <T>(
    query: Query<(Document<unknown, unknown, T> & T)[], Document<unknown, unknown, T> & T, unknown, T>,
    attributes: Array<string>,
    page: number,
    limit: number
): Promise<{
    documents: Partial<T>[];
    pagination: HttpResponsePagination;
}> => {
    const selectAttribs: Record<string, number> = { _id: 0 };
    attributes.forEach((attribute) => {
        selectAttribs[attribute] = 1;
    });

    const totalCount = await query.clone().count();
    const documents: Array<Partial<T>> = await query
        .skip((page - 1) * limit)
        .limit(limit)
        .select(selectAttribs);

    const pagination: HttpResponsePagination = {
        totalCount: totalCount,
        count: documents.length,
        page: page,
        totalPages: Math.ceil(totalCount / limit),
    };
    return { documents, pagination };
};

export const performDynamoDBTransactions = async (queries: Array<Promise<Transaction>>) => {
    if (!queries.length) {
        return;
    }
    await dynamoose.transaction(queries);
};

export const performMongoDBTransactions = async (queries: Array<Query<unknown, Document<unknown>>>) => {
    if (!queries.length) {
        return;
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    for (const query of queries) {
        const doc = await query.session(session);
        if (!doc) {
            throw new HttpError(ERROR_MESSAGES.TRANSACTION_ERROR, 400, ERROR_CODES.TRANSACTION_ERROR);
        }
    }
    await session.commitTransaction();
    await session.endSession();
};
