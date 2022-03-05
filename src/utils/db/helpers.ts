import { Scan } from 'dynamoose/dist/DocumentRetriever';
import { ObjectType } from 'dynamoose/dist/General';
import { v4 } from 'uuid';
import { HttpDynamoDBResponsePagination, HttpResponsePagination } from '../../interfaces/generic';
import { IDynamooseDocument } from '../../interfaces/generic';
import { IMinifiedUser } from '../../interfaces/api';
import { ICognitoUserInfoApiResponse } from '../../interfaces/jwt';
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

export const getNewUserModelFromJWTUserPayload = async (
    jwtUserPayload: ICognitoUserInfoApiResponse
): Promise<IUser> => {
    const newCertification: ICertifications = await DBQueries.createCertifications();
    const newExperience: IExperiences = await DBQueries.createExperiences();
    const newSkills: ISkills = await DBQueries.createSkills();
    const newProjects: IProjects = await DBQueries.createProjects();
    const newUser: IUser = {
        id: v4(),
        aboutUser: '',
        backgroundImageUrl: '',
        connectionCount: 0,
        currentPosition: '',
        dateOfBirth: new Date(0),
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
    initialQuery: Scan<IDynamooseDocument<T>>,
    attributes: Array<string>,
    requestLimit: number,
    dDBAssistStartFromId: string | undefined
): Promise<{
    documents: Partial<T>[];
    dDBPagination: HttpDynamoDBResponsePagination;
}> => {
    let startSearchFromId: ObjectType | undefined = dDBAssistStartFromId ? { id: dDBAssistStartFromId } : undefined;
    let documents: Array<Partial<T>> = [];
    do {
        const query = initialQuery;
        if (startSearchFromId) {
            query.startAt(startSearchFromId);
        }
        const searchedDocuments = await query.limit(DYNAMODB_USER_SEARCH_SCAN_LIMIT).attributes(attributes).exec();
        startSearchFromId = searchedDocuments.lastKey;
        (searchedDocuments as Array<Partial<T>>).forEach((searchedDocument) => {
            documents.push(searchedDocument);
        });
    } while (documents.length < requestLimit && startSearchFromId);

    let nextSearchStartFromId: string | undefined = startSearchFromId?.id;
    if (requestLimit < documents.length) {
        documents = [...documents.slice(0, requestLimit)];
        nextSearchStartFromId = documents?.[documents.length - 1]?.id as string;
    }
    const dDBPagination: HttpDynamoDBResponsePagination = {
        nextSearchStartFromId,
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
