import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { SQS } from 'aws-sdk';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errors';
import ENV from '../constants/env';
import asyncHandler from '../middlewares/asyncHandler';
import { HttpResponse } from '../interfaces/generic';
import { IConnectionType, INotificationActivity } from '../interfaces/api';
import { IEditableUser } from '../models/user';
import { ISkillSet } from '../models/skills';
import { IProject } from '../models/projects';
import { IExperience } from '../models/experience';
import { ICertification } from '../models/certifications';
import { IConnection } from '../models/connection';
import DBQueries from '../utils/db/queries';
import { HttpError } from '../utils/error';
import { generateUploadURL } from '../utils/storage/utils';
import { performDynamoDBTransactions } from '../utils/db/helpers';
import SQS_QUEUE from '../utils/queue';
import DBTransactions from '../utils/db/transactions';
import {
    getExpandedProjectCollaborators,
    getExpandedUserConnections,
    getExpandedUserSkillSetEndorsers,
} from '../utils/transformers';

const getUserProfile = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const authUser = req.authUser;
    if (!authUser) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    const user = await DBQueries.getUserById(userId as string);
    const response: HttpResponse = {
        success: true,
        data: user,
    };
    return res.status(200).json(response);
};

const patchUserProfile = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        throw new HttpError(err.array()[0].param, 400, ERROR_CODES.INVALID_ERROR);
    }
    const userId = req.params.user_id;
    const userUpdateDetails: IEditableUser = req.body;
    const authUser = req.authUser;
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    const user = await DBQueries.updateUser(userId, userUpdateDetails);
    const response: HttpResponse = {
        success: true,
        data: user,
    };
    return res.status(200).json(response);
};

const postUserFeedback = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const subject = req.body.subject;
    const feedbackType = req.body.feedbackType;
    const description = req.body.description;
    const authUser = req.authUser;
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }

    const feedback = await DBQueries.createFeedback(userId, subject, description, feedbackType);
    const response: HttpResponse = {
        success: true,
        data: feedback,
    };
    return res.status(200).json(response);
};

const postFollowingForUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const followeeId = req.params.followee_id;
    const authUser = req.authUser;
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    if (userId === followeeId) {
        throw new HttpError(ERROR_MESSAGES.USER_REQUEST_SELF, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    const follow = await DBQueries.getFollow(userId, followeeId);
    if (follow) {
        throw new HttpError(ERROR_MESSAGES.USER_FOLLOWING, 400, ERROR_CODES.REDUNDANT_ERROR);
    } else {
        await performDynamoDBTransactions([DBTransactions.createFollowTransaction(userId, followeeId)]);

        await DBQueries.updateUserFollowCountQuery(userId, 'followeeCount', 1);
        await DBQueries.updateUserFollowCountQuery(followeeId, 'followerCount', 1);

        const user = await DBQueries.getUserById(userId);
        const response: HttpResponse = {
            success: true,
            data: user,
        };

        return res.status(200).json(response);
    }
};

const deleteFollowingForUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const followeeId = req.params.followee_id;
    const authUser = req.authUser;
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    if (userId === followeeId) {
        throw new HttpError(ERROR_MESSAGES.USER_REQUEST_SELF, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    const follow = await DBQueries.getFollow(userId, followeeId);
    if (!follow) {
        throw new HttpError(ERROR_MESSAGES.USER_NOT_FOLLOWING, 400, ERROR_CODES.REDUNDANT_ERROR);
    } else {
        await performDynamoDBTransactions([DBTransactions.deleteFollowTransaction(follow.id)]);

        await DBQueries.updateUserFollowCountQuery(userId, 'followeeCount', -1);
        await DBQueries.updateUserFollowCountQuery(followeeId, 'followerCount', -1);

        const user = await DBQueries.getUserById(userId);
        const response: HttpResponse = {
            success: true,
            data: user,
        };
        return res.status(200).json(response);
    }
};

const getConnectionsForUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const connectionType = (req.query.connectionType as IConnectionType) || 'all';
    const limit = Number(req.query.limit as string);
    const startFromId = req.query.dDBAssistStartFromId as string;
    const { documents: userConnections, dDBPagination: pagination } = await DBQueries.getConnections(
        userId,
        connectionType,
        limit,
        startFromId
    );

    const data = await getExpandedUserConnections(userConnections as IConnection[]);
    const response: HttpResponse = {
        success: true,
        data: data,
        dDBPagination: pagination,
    };
    return res.status(200).send(response);
};

const getConnectionForUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const connecteeId = req.params.connectee_id;

    const userConnection = await DBQueries.getConnection(userId, connecteeId);

    if (!userConnection) {
        throw new HttpError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, 404);
    }

    const response: HttpResponse = {
        success: true,
        data: userConnection,
    };

    return res.status(200).send(response);
};

const postCreateConnectionForUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const connecteeId = req.params.connectee_id;
    const authUser = req.authUser;
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    if (userId === connecteeId) {
        throw new HttpError(ERROR_MESSAGES.USER_REQUEST_SELF, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    const userInitiatedConnection = await DBQueries.getConnection(userId, connecteeId);
    const connecteeIntiatedConnection = await DBQueries.getConnection(connecteeId, userId);
    if (userInitiatedConnection || connecteeIntiatedConnection) {
        if (userInitiatedConnection.isConnected || connecteeIntiatedConnection.isConnected) {
            throw new HttpError(ERROR_MESSAGES.USER_CONNECTED, 400, ERROR_CODES.REDUNDANT_ERROR);
        }
        throw new HttpError(ERROR_MESSAGES.USER_CONNECTION_REQUEST, 400, ERROR_CODES.REDUNDANT_ERROR);
    } else {
        await performDynamoDBTransactions([
            DBTransactions.createUserConnectionTransaction(userId, connecteeId, true),
            DBTransactions.createUserConnectionTransaction(connecteeId, userId, false),
        ]);
        const userUpdatedConnection = await DBQueries.getConnection(userId, connecteeId);
        const connecteeIntiatedConnection = await DBQueries.getConnection(connecteeId, userId);
        const notificationActivity: INotificationActivity = {
            resourceRefId: connecteeIntiatedConnection.id,
            activityType: 'connectionRequest',
        };
        const notificationQueueParams: SQS.SendMessageRequest = {
            MessageBody: JSON.stringify(notificationActivity),
            QueueUrl: ENV.AWS.NOTIFICATIONS_SQS_URL,
        };
        await SQS_QUEUE.sendMessage(notificationQueueParams).promise();

        const response: HttpResponse = {
            success: true,
            data: userUpdatedConnection,
        };
        return res.status(200).json(response);
    }
};

const patchConfirmConnectionForUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const connecteeId = req.params.connectee_id;
    const authUser = req.authUser;
    const connectedAt = Date.now();
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    if (userId === connecteeId) {
        throw new HttpError(ERROR_MESSAGES.USER_REQUEST_SELF, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    const userInitiatedConnection = await DBQueries.getConnection(userId, connecteeId);
    const connecteeIntiatedConnection = await DBQueries.getConnection(connecteeId, userId);
    if (!userInitiatedConnection || !connecteeIntiatedConnection) {
        throw new HttpError(ERROR_MESSAGES.USER_NO_CONNECTION_REQUEST, 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }
    if (userInitiatedConnection.isConnected || connecteeIntiatedConnection.isConnected) {
        throw new HttpError(ERROR_MESSAGES.USER_CONNECTED, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    if (
        userInitiatedConnection.connectionInitiatedBy === userId ||
        connecteeIntiatedConnection.connectionInitiatedBy === userId
    ) {
        throw new HttpError(ERROR_MESSAGES.USER_CANNOT_CONFIRM, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    const userFollowing = await DBQueries.getFollow(userId, connecteeId);
    const connecteeFollowing = await DBQueries.getFollow(connecteeId, userId);
    await performDynamoDBTransactions([
        DBTransactions.confirmConnectionTransaction(userInitiatedConnection.id, connectedAt),
        DBTransactions.confirmConnectionTransaction(connecteeIntiatedConnection.id, connectedAt),
    ]);

    await DBQueries.updateUserConnectionCountQuery(userId, 1);
    await DBQueries.updateUserConnectionCountQuery(connecteeId, 1);

    await performDynamoDBTransactions([
        ...(!userFollowing ? [DBTransactions.createFollowTransaction(userId, connecteeId)] : []),
        ...(!connecteeFollowing ? [DBTransactions.createFollowTransaction(connecteeId, userId)] : []),
    ]);

    if (!userFollowing) {
        await DBQueries.updateUserFollowCountQuery(userId, 'followeeCount', 1);
        await DBQueries.updateUserFollowCountQuery(connecteeId, 'followerCount', 1);
    }

    if (!connecteeFollowing) {
        await DBQueries.updateUserFollowCountQuery(userId, 'followerCount', 1);
        await DBQueries.updateUserFollowCountQuery(connecteeId, 'followeeCount', 1);
    }

    const notificationActivity: INotificationActivity = {
        resourceRefId: connecteeIntiatedConnection.id,
        activityType: 'connectionConfirmation',
    };
    const notificationQueueParams: SQS.SendMessageRequest = {
        MessageBody: JSON.stringify(notificationActivity),
        QueueUrl: ENV.AWS.NOTIFICATIONS_SQS_URL,
    };
    await SQS_QUEUE.sendMessage(notificationQueueParams).promise();

    const userUpdatedConnection = await DBQueries.getConnection(userId, connecteeId);
    const response: HttpResponse = {
        success: true,
        data: userUpdatedConnection,
    };
    return res.status(200).json(response);
};

const deleteConnectionForUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const connecteeId = req.params.connectee_id;
    const authUser = req.authUser;
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    if (userId === connecteeId) {
        throw new HttpError(ERROR_MESSAGES.USER_REQUEST_SELF, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    const userInitiatedConnection = await DBQueries.getConnection(userId, connecteeId);
    const connecteeIntiatedConnection = await DBQueries.getConnection(connecteeId, userId);
    if (!userInitiatedConnection || !connecteeIntiatedConnection) {
        throw new HttpError(ERROR_MESSAGES.USER_NO_CONNECTION_REQUEST, 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }
    const userFollowing = await DBQueries.getFollow(userId, connecteeId);
    const connecteeFollowing = await DBQueries.getFollow(connecteeId, userId);

    await performDynamoDBTransactions([
        DBTransactions.deleteConnectionTransaction(userInitiatedConnection.id),
        DBTransactions.deleteConnectionTransaction(connecteeIntiatedConnection.id),
    ]);

    if (userInitiatedConnection.isConnected) {
        await DBQueries.updateUserConnectionCountQuery(userId, -1);
        await DBQueries.updateUserConnectionCountQuery(connecteeId, -1);
    }

    await performDynamoDBTransactions([
        ...(userFollowing ? [DBTransactions.deleteFollowTransaction(userFollowing.id)] : []),
        ...(connecteeFollowing ? [DBTransactions.deleteFollowTransaction(connecteeFollowing.id)] : []),
    ]);

    if (userFollowing) {
        await DBQueries.updateUserFollowCountQuery(userId, 'followeeCount', -1);
        await DBQueries.updateUserFollowCountQuery(userId, 'followerCount', -1);
    }

    if (connecteeFollowing) {
        await DBQueries.updateUserFollowCountQuery(connecteeId, 'followerCount', -1);
        await DBQueries.updateUserFollowCountQuery(connecteeId, 'followeeCount', -1);
    }

    const response: HttpResponse = {
        success: true,
        data: undefined,
    };
    return res.status(200).json(response);
};

const getUserSkills = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const user = await DBQueries.getUserById(userId);
    const userSkills = await DBQueries.getSkills(user.skillsRefId);
    const transformedSkills = await getExpandedUserSkillSetEndorsers(userSkills);
    const response: HttpResponse = {
        success: true,
        data: transformedSkills,
    };
    return res.status(200).json(response);
};

const putUserSkills = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const skillSets = req.body as Array<ISkillSet>;
    const user = await DBQueries.getUserById(userId);
    const updatedSkills = await DBQueries.updateSkills(user.skillsRefId, skillSets);
    const transformedSkills = await getExpandedUserSkillSetEndorsers(updatedSkills);
    const response: HttpResponse = {
        success: true,
        data: transformedSkills,
    };
    return res.status(200).json(response);
};

const getUserExperiences = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const user = await DBQueries.getUserById(userId);
    const userExperience = await DBQueries.getExperiences(user.experiencesRefId);
    const response: HttpResponse = {
        success: true,
        data: userExperience,
    };
    return res.status(200).json(response);
};

const putUserExperiences = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const experiences = req.body as Array<IExperience>;
    const user = await DBQueries.getUserById(userId);
    const updatedExperiences = await DBQueries.updateExperiences(user.experiencesRefId, experiences);
    const response: HttpResponse = {
        success: true,
        data: updatedExperiences,
    };
    return res.status(200).json(response);
};

const getUserCertifications = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const user = await DBQueries.getUserById(userId);
    const userProjcts = await DBQueries.getCertifications(user.certificationsRefId);
    const response: HttpResponse = {
        success: true,
        data: userProjcts,
    };
    return res.status(200).json(response);
};

const putUserCertifications = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const certificates = req.body as Array<ICertification>;
    const user = await DBQueries.getUserById(userId);
    const updatedCertificates = await DBQueries.updateCertifications(user.certificationsRefId, certificates);
    const response: HttpResponse = {
        success: true,
        data: updatedCertificates,
    };
    return res.status(200).json(response);
};

const getUserProjects = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const user = await DBQueries.getUserById(userId);
    const userProjects = await DBQueries.getProjects(user.projectsRefId);
    const transformedProjects = await getExpandedProjectCollaborators(userProjects);
    const response: HttpResponse = {
        success: true,
        data: transformedProjects,
    };
    return res.status(200).json(response);
};

const putUserProjects = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const projects = req.body as Array<IProject>;
    const user = await DBQueries.getUserById(userId);
    const updatedProjects = await DBQueries.updateProjects(user.projectsRefId, projects);
    const transformedProjects = await getExpandedProjectCollaborators(updatedProjects);
    const response: HttpResponse = {
        success: true,
        data: transformedProjects,
    };
    return res.status(200).json(response);
};

const getUserUploadSignedURL = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const authUser = req.authUser;
    const userId = req.params.user_id;
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    const imageType = req.query.imageType;
    if (!imageType || !['display_picture', 'background_image'].includes(imageType as string)) {
        throw new HttpError(ERROR_MESSAGES.USER_SIGNED_URL_QUERY_PARAM, 400, ERROR_CODES.RESOURCE_NOT_FOUND);
    }
    const signedURL = await generateUploadURL(`${authUser?.id as string}/${imageType}`);
    const response: HttpResponse = {
        success: true,
        data: signedURL,
    };
    res.status(200).send(response);
};

const getUserSearch = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const searchTerm = req.query.search as string;
    const limit = Number(req.query.limit as string);
    const page = Number(req.query.page as string);
    const { users: data, pagination } = await DBQueries.searchUsersByName(searchTerm, page, limit);
    const response: HttpResponse = {
        success: true,
        data: data,
        pagination,
    };
    return res.status(200).json(response);
};

const USER_CONTROLLER = {
    getUserProfile: asyncHandler(getUserProfile),
    patchUserProfile: asyncHandler(patchUserProfile),
    getConnectionsForUser: asyncHandler(getConnectionsForUser),
    getConnectionForUser: asyncHandler(getConnectionForUser),
    postCreateConnectionForUser: asyncHandler(postCreateConnectionForUser),
    patchConfirmConnectionForUser: asyncHandler(patchConfirmConnectionForUser),
    deleteConnectionForUser: asyncHandler(deleteConnectionForUser),
    postFollowingForUser: asyncHandler(postFollowingForUser),
    deleteFollowingForUser: asyncHandler(deleteFollowingForUser),
    getUserSkills: asyncHandler(getUserSkills),
    putUserSkills: asyncHandler(putUserSkills),
    getUserUploadSignedURL: asyncHandler(getUserUploadSignedURL),
    getUserSearch: asyncHandler(getUserSearch),
    getUserProjects: asyncHandler(getUserProjects),
    putUserProjects: asyncHandler(putUserProjects),
    getUserExperiences: asyncHandler(getUserExperiences),
    putUserExperiences: asyncHandler(putUserExperiences),
    getUserCertifications: asyncHandler(getUserCertifications),
    putUserCertifications: asyncHandler(putUserCertifications),
    postUserFeedback: asyncHandler(postUserFeedback),
};

export default USER_CONTROLLER;
