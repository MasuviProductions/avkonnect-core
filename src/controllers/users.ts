import { NextFunction, Request, Response } from 'express';
import dynamoose from 'dynamoose';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errors';
import asyncHandler from '../middlewares/asyncHandler';
import { DBQueries } from '../utils/db/queries';
import { HttpError } from '../utils/error';
import { HttpResponse } from '../interfaces/generic';
import { validationResult } from 'express-validator';
import { IEditableUser, IUserSkill } from '../models/user';
import { deleteFileFromS3, getFileFromS3 } from '../utils/storage/utils';
import { handleDisplayPictureUpload } from '../utils/generic';
import {
    BACKGROUND_PICTURE_RESOLUTION,
    DISPLAY_PICTURE_RESOLUTION,
    THUMBNAIL_IMAGE_RESOLUTION,
} from '../constants/generic';

const getUserProfile = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const authUser = req.user;
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
    const authUser = req.user;
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

const postFollowingForUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const followingId = req.params.following_id;
    const authUser = req.user;
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    if (userId === followingId) {
        throw new HttpError(ERROR_MESSAGES.USER_REQUEST_SELF, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    await dynamoose.transaction([
        DBQueries.updateUserFollowResourceTransaction(userId, followingId, 'following'),
        DBQueries.updateUserFollowResourceTransaction(followingId, userId, 'followers'),
    ]);
    const user = await DBQueries.getUserById(userId);
    const response: HttpResponse = {
        success: true,
        data: user.following,
    };
    return res.status(200).json(response);
};

const deleteFollowingForUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const followingId = req.params.following_id;
    const authUser = req.user;
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    if (userId === followingId) {
        throw new HttpError(ERROR_MESSAGES.USER_REQUEST_SELF, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    await dynamoose.transaction([
        DBQueries.deleteUserFollowResourceTransaction(userId, followingId, 'following'),
        DBQueries.deleteUserFollowResourceTransaction(followingId, userId, 'followers'),
    ]);
    const user = await DBQueries.getUserById(userId);
    const response: HttpResponse = {
        success: true,
        data: user.following,
    };
    return res.status(200).json(response);
};

const postCreateConnectionForUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const connectionId = req.params.connection_id;
    const authUser = req.user;
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    if (userId === connectionId) {
        throw new HttpError(ERROR_MESSAGES.USER_REQUEST_SELF, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    await dynamoose.transaction([
        DBQueries.createUserConnectionTransaction(userId, connectionId, true),
        DBQueries.createUserConnectionTransaction(connectionId, userId, false),
    ]);
    const user = await DBQueries.getUserById(userId);
    const response: HttpResponse = {
        success: true,
        data: user.connections,
    };
    return res.status(200).json(response);
};

const patchConfirmConnectionForUser = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const connectionId = req.params.connection_id;
    const authUser = req.user;
    const connectedAt = Date.now();
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    if (userId === connectionId) {
        throw new HttpError(ERROR_MESSAGES.USER_REQUEST_SELF, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    await dynamoose.transaction([
        DBQueries.confirmUserConnectionTransaction(userId, connectionId, connectedAt),
        DBQueries.confirmUserConnectionTransaction(connectionId, userId, connectedAt, true),
    ]);
    await dynamoose.transaction([
        DBQueries.updateUserFollowResourceTransaction(userId, connectionId, 'following'),
        DBQueries.updateUserFollowResourceTransaction(connectionId, userId, 'followers'),
    ]);
    await dynamoose.transaction([
        DBQueries.updateUserFollowResourceTransaction(userId, connectionId, 'followers'),
        DBQueries.updateUserFollowResourceTransaction(connectionId, userId, 'following'),
    ]);
    const user = await DBQueries.getUserById(userId);
    const response: HttpResponse = {
        success: true,
        data: user.connections,
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
    const connectionId = req.params.connection_id;
    const authUser = req.user;
    if (!authUser || authUser.id !== userId) {
        throw new HttpError(ERROR_MESSAGES.FORBIDDEN_ACCESS, 403, ERROR_CODES.AUTHORIZATION_ERROR);
    }
    if (userId === connectionId) {
        throw new HttpError(ERROR_MESSAGES.USER_REQUEST_SELF, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    await dynamoose.transaction([
        DBQueries.deleteUserConnectionTransaction(userId, connectionId),
        DBQueries.deleteUserConnectionTransaction(connectionId, userId),
    ]);
    await dynamoose.transaction([
        DBQueries.deleteUserFollowResourceTransaction(userId, connectionId, 'following'),
        DBQueries.deleteUserFollowResourceTransaction(connectionId, userId, 'followers'),
    ]);
    await dynamoose.transaction([
        DBQueries.deleteUserFollowResourceTransaction(userId, connectionId, 'followers'),
        DBQueries.deleteUserFollowResourceTransaction(connectionId, userId, 'following'),
    ]);
    const user = await DBQueries.getUserById(userId);
    const response: HttpResponse = {
        success: true,
        data: user.connections,
    };
    return res.status(200).json(response);
};

const patchEndorseUserSkill = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const requestingUser = req.user;
    const skill = req.body.skill;
    const user = await DBQueries.getUserById(userId);
    const userSkills: IUserSkill[] = user.skills;
    const matchedUserSkill = userSkills.find((userSkill) => userSkill.skill === skill);
    if (!matchedUserSkill) {
        throw new HttpError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, 404, ERROR_CODES.NOT_FOUND_ERROR);
    }
    if (matchedUserSkill.endorsers) {
        if (matchedUserSkill.endorsers.includes(requestingUser?.id as string)) {
            throw new HttpError(ERROR_MESSAGES.USER_SKILL_ENDORSED, 400, ERROR_CODES.REDUNDANT_ERROR);
        }
    } else {
        matchedUserSkill.endorsers = Array<string>();
    }
    matchedUserSkill.endorsers.push(requestingUser?.id as string);
    const updatedSkills: IEditableUser = { skills: userSkills };
    await DBQueries.updateUser(userId, updatedSkills);
    const response: HttpResponse = {
        success: true,
        data: 'success',
    };
    return res.status(200).json(response);
};

const deleteUnendorseUserSkill = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const requestingUser = req.user;
    const skill = req.body.skill;
    const user = await DBQueries.getUserById(userId);
    const userSkills: IUserSkill[] = user.skills;
    const matchedUserSkill = userSkills.find((userSkill) => userSkill.skill === skill);
    if (!matchedUserSkill) {
        throw new HttpError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, 404, ERROR_CODES.NOT_FOUND_ERROR);
    }
    const userEndorsers = matchedUserSkill.endorsers;
    if (userEndorsers) {
        const endorserIndex = userEndorsers.findIndex((endorser) => endorser === (requestingUser?.id as string));
        if (endorserIndex >= 0) {
            userEndorsers[endorserIndex] = userEndorsers[userEndorsers.length - 1];
            userEndorsers.pop();
            const updatedSkills: IEditableUser = { skills: userSkills };

            await DBQueries.updateUser(userId, updatedSkills);

            const response: HttpResponse = {
                success: true,
                data: 'success',
            };

            return res.status(200).json(response);
        }
    }
    throw new HttpError(ERROR_MESSAGES.USER_SKILL_UNENDORSED, 400, ERROR_CODES.REDUNDANT_ERROR);
};

const getUserDisplayPicture = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const isThumbnailImage = req.query.thumbnail === 'true';
    const userId = req.params.user_id;
    const file = await getFileFromS3(`${userId as string}/display_picture${isThumbnailImage ? '_thumbnail' : ''}`);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('isBase64Encoded', 'true');
    res.send(file.Body);
};

const putUserDisplayPicture = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const user = req.user;
    const userDp = req.file;
    if (!userDp) {
        throw new HttpError(ERROR_MESSAGES.ACTION_INVALID, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    const originalFileLocation = userDp.path;
    const displayPictureStorageFileLocation = `${user?.id as string}/display_picture`;
    const displayPictureFileLocation = `${originalFileLocation}_resized`;
    const displayPictureFileResponse = await handleDisplayPictureUpload(
        originalFileLocation,
        displayPictureFileLocation,
        displayPictureStorageFileLocation,
        DISPLAY_PICTURE_RESOLUTION
    );
    const thumbnailImageStorageFileLocation = `${displayPictureStorageFileLocation}_thumbnail`;
    const thumbnailFileLocation = `${originalFileLocation}_thumbnail`;
    await handleDisplayPictureUpload(
        originalFileLocation,
        thumbnailFileLocation,
        thumbnailImageStorageFileLocation,
        THUMBNAIL_IMAGE_RESOLUTION,
        true
    );
    const updatedDisplayPicture: IEditableUser = { displayPictureUrl: displayPictureFileResponse.Location };
    const updatedUser = await DBQueries.updateUser(user?.id as string, updatedDisplayPicture);
    const response: HttpResponse = {
        success: true,
        data: updatedUser,
    };
    res.status(200).send(response);
};

const deleteUserDisplayPicture = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const user = req.user;
    await deleteFileFromS3(`${user?.id as string}/display_picture`);
    const updatedDisplayPicture: IEditableUser = { displayPictureUrl: '' };
    const updatedUser = await DBQueries.updateUser(user?.id as string, updatedDisplayPicture);
    const response: HttpResponse = {
        success: true,
        data: updatedUser,
    };
    res.status(200).send(response);
};

const getUserBackgroundPicture = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const userId = req.params.user_id;
    const file = await getFileFromS3(`${userId as string}/background_picture`);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('isBase64Encoded', 'true');
    res.send(file.Body);
};

const putUserBackgroundPicture = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const user = req.user;
    const userDp = req.file;
    if (!userDp) {
        throw new HttpError(ERROR_MESSAGES.ACTION_INVALID, 400, ERROR_CODES.REDUNDANT_ERROR);
    }
    const originalFileLocation = userDp.path;
    const backgroundPictureStorageFileLocation = `${user?.id as string}/background_picture`;
    const backgroundPictureFileLocation = `${originalFileLocation}_resized`;
    const backgroundPictureFileResponse = await handleDisplayPictureUpload(
        originalFileLocation,
        backgroundPictureFileLocation,
        backgroundPictureStorageFileLocation,
        BACKGROUND_PICTURE_RESOLUTION
    );
    const updatedBackgroundPicture: IEditableUser = { backgroundPictureUrl: backgroundPictureFileResponse.Location };
    const updatedUser = await DBQueries.updateUser(user?.id as string, updatedBackgroundPicture);
    const response: HttpResponse = {
        success: true,
        data: updatedUser,
    };
    res.status(200).send(response);
};

const deleteUserBackgroundPicture = async (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const user = req.user;
    await deleteFileFromS3(`${user?.id as string}/display_picture`);
    const updatedBackgroundPicture: IEditableUser = { backgroundPictureUrl: '' };
    const updatedUser = await DBQueries.updateUser(user?.id as string, updatedBackgroundPicture);
    const response: HttpResponse = {
        success: true,
        data: updatedUser,
    };
    res.status(200).send(response);
};

const USER_CONTROLLER = {
    getUserProfile: asyncHandler(getUserProfile),
    patchUserProfile: asyncHandler(patchUserProfile),
    postCreateConnectionForUser: asyncHandler(postCreateConnectionForUser),
    patchConfirmConnectionForUser: asyncHandler(patchConfirmConnectionForUser),
    deleteConnectionForUser: asyncHandler(deleteConnectionForUser),
    postFollowingForUser: asyncHandler(postFollowingForUser),
    deleteFollowingForUser: asyncHandler(deleteFollowingForUser),
    patchEndorseUserSkill: asyncHandler(patchEndorseUserSkill),
    deleteUnendorseUserSkill: asyncHandler(deleteUnendorseUserSkill),
    getUserDisplayPicture: asyncHandler(getUserDisplayPicture),
    putUserDisplayPicture: asyncHandler(putUserDisplayPicture),
    deleteUserDisplayPicture: asyncHandler(deleteUserDisplayPicture),
    getUserBackgroundPicture: asyncHandler(getUserBackgroundPicture),
    putUserBackgroundPicture: asyncHandler(putUserBackgroundPicture),
    deleteUserBackgroundPicture: asyncHandler(deleteUserBackgroundPicture),
};

export default USER_CONTROLLER;
