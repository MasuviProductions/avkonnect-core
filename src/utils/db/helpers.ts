import { Scan } from 'dynamoose/dist/DocumentRetriever';
import { ObjectType } from 'dynamoose/dist/General';
import { v4 } from 'uuid';
import { HttpDDBResponsePagination } from '../../interfaces/generic';
import { IDynamooseDocument } from '../../interfaces/generic';
import { IAuthUser, IMinifiedUser } from '../../interfaces/api';
import { ICognitoUserInfoApiResponse } from '../../interfaces/jwt';
import { IUser, IUserExperience } from '../../models/user';
import DBQueries from './queries';
import { IProjects } from '../../models/projects';
import { ISkills } from '../../models/skills';

export const getNewUserModelFromJWTUserPayload = async (
    jwtUserPayload: ICognitoUserInfoApiResponse
): Promise<IUser> => {
    const newSkills: ISkills = await DBQueries.createSkills();
    const newProjects: IProjects = await DBQueries.createProjects();
    return {
        id: v4(),
        aboutUser: '',
        backgroundImageUrl: '',
        connectionCount: 0,
        currentPosition: '',
        dateOfBirth: 0,
        displayPictureUrl: '',
        experiences: Array<IUserExperience>(),
        email: jwtUserPayload.email,
        followerCount: 0,
        followeeCount: 0,
        headline: '',
        name: jwtUserPayload.name,
        phone: '',
        preferences: { connections: { isPrivate: false } },
        projectsRefId: newProjects.id,
        searchFields: { name: jwtUserPayload.name.toLowerCase() },
        skillsRefId: newSkills.id,
    };
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

export const getAuthUser = (user: IUser): IAuthUser | undefined => {
    if (!user) {
        return;
    }
    const authUser: IAuthUser = {
        id: user.id,
        email: user.email,
    };
    return authUser;
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

export const fetchDDBPaginatedDocuments = async <T extends { id: string }>(
    initialQuery: Scan<IDynamooseDocument<T>>,
    attributes: Array<string>,
    requestLimit: number,
    dDBAssistStartFromId: string | undefined
) => {
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
    const dDBPagination: HttpDDBResponsePagination = {
        nextSearchStartFromId,
        count: documents.length,
    };
    return { documents, dDBPagination };
};
