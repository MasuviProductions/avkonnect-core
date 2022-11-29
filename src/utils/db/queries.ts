import * as dynamoose from 'dynamoose';
import { v4 } from 'uuid';
import Skills, { ISkills, ISkillSet } from '../../models/skills';
import Connection, { IConnection } from '../../models/connection';
import Follow, { IFollow } from '../../models/follow';
import { fetchDynamoDBPaginatedDocuments, fetchMongoDBPaginatedDocuments, IFollowResourceValues } from './helpers';
import Projects, { IProject, IProjects } from '../../models/projects';
import Settings, {
    IUserSettings,
    IUserSettingsDisplay,
    IUserSettingsPrivacy,
    IUserSettingsCommunications,
    IUserSettingsPrivacyOption,
    IUserSettingsCommunicationsOption,
    IUserSettingsDisplayOption,
    ISettingsUpdateDetail,
} from '../../models/userSettings';
import Experiences, { IExperience, IExperiences } from '../../models/experience';
import Certifications, { ICertifications, ICertification } from '../../models/certifications';
import Feedback, { IFeedback } from '../../models/feedbacks';
import User, { IUser, IEditableUser } from '../../models/user';
import { HttpDynamoDBResponsePagination, HttpResponsePagination } from '../../interfaces/generic';
import { HttpError } from '../error';
import { ERROR_CODES, ERROR_MESSAGES } from '../../constants/errors';
import { IConnectionType } from '../../interfaces/api';
import { ObjectType } from 'dynamoose/dist/General';

const getAuthUserByEmail = async (email: string): Promise<IUser | undefined> => {
    const user: IUser | null = await User.findOne({
        email: email,
    }).select({ name: 1, email: 1, id: 1, _id: 0 });
    if (!user) {
        return;
    }
    return user;
};

const getUserById = async (id: string): Promise<IUser> => {
    const user: IUser | null = await User.findOne({
        id: id,
    });
    if (!user) {
        throw new HttpError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, 404);
    }
    return user;
};

const getUserInfoForIds = async (idList: Set<string>): Promise<Array<Partial<IUser>>> => {
    if (idList.size <= 0) {
        return [];
    }
    const users: Array<Partial<IUser>> = await User.find({
        id: {
            $in: Array.from(idList),
        },
    }).select({
        id: 1,
        name: 1,
        headline: 1,
        displayPictureUrl: 1,
        backgroundImageUrl: 1,
        email: 1,
        location: 1,
        gender: 1,
        _id: 0,
    });
    return users;
};

const searchUsersByName = async (
    searchString: string,
    page: number,
    limit: number
): Promise<{ users: Array<Partial<IUser>>; pagination: HttpResponsePagination }> => {
    const searchUser = User.find({ name: { $regex: `^${searchString}`, $options: 'i' } }).sort({ name: 1 });
    const resultAttributes = ['id', 'name', 'headline', 'displayPictureUrl'];
    const { documents: users, pagination } = await fetchMongoDBPaginatedDocuments<IUser>(
        searchUser,
        resultAttributes,
        page,
        limit
    );

    return { users, pagination };
};

const createFeedback = async (
    userId: string,
    subject: string,
    description: string,
    feedbackType: string
): Promise<IFeedback> => {
    const feedback: IFeedback = {
        id: v4(),
        userId: userId,
        subject: subject,
        description: description,
        feedbackType: feedbackType,
    };
    const feedbackObj = new Feedback(feedback);
    await feedbackObj.save();
    return feedback;
};

const createUser = async (user: IUser): Promise<IUser> => {
    const myUser = new User(user);
    const createdUser: IUser = await myUser.save();
    return createdUser;
};

const updateUser = async (userId: string, user: IEditableUser): Promise<IUser> => {
    const updatedUser: IUser | null = await User.findOneAndUpdate({ id: { $eq: userId } }, user, { new: true });
    if (!updatedUser) {
        throw new HttpError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, 404);
    }
    return updatedUser;
};

const updateUserConnectionCountQuery = (userId: string, factor: number) => {
    return User.updateOne({ id: userId }, { $inc: { connectionCount: factor } });
};

const updateUserFollowCountQuery = (userId: string, followType: 'followeeCount' | 'followerCount', factor: number) => {
    return User.updateOne({ id: userId }, { $inc: { [followType]: factor } });
};

const getUserFollowResources = async (
    userId: string,
    queryField: IFollowResourceValues,
    attributeField: IFollowResourceValues
): Promise<Array<string>> => {
    const follows = await Follow.scan(queryField).eq(userId).attribute(attributeField).exec();
    const followResource = follows.map((follow) => follow[attributeField]);
    return followResource;
};

const getFollow = async (followerId: string, followeeId: string): Promise<IFollow> => {
    const follows = await Follow.scan(
        new dynamoose.Condition().where('followerId').eq(followerId).and().where('followeeId').eq(followeeId)
    ).exec();
    return follows[0];
};

const getConnectionById = async (connectionId: string): Promise<IConnection> => {
    const connection = await Connection.get(connectionId);
    if (!connection) {
        throw new HttpError(ERROR_MESSAGES.RESOURCE_NOT_FOUND, 404, ERROR_CODES.NOT_FOUND_ERROR);
    }
    return connection;
};

const getConnection = async (connectorId: string, connecteeId: string): Promise<IConnection> => {
    const connections = await Connection.scan(
        new dynamoose.Condition().where('connectorId').eq(connectorId).and().where('connecteeId').eq(connecteeId)
    ).exec();
    return connections[0];
};

const getConnections = async (
    connectorId: string,
    connectionType: IConnectionType,
    limit: number,
    nextSearchStartFromKey?: ObjectType
): Promise<{ documents: Partial<IConnection>[]; dDBPagination: HttpDynamoDBResponsePagination }> => {
    const queryCondition = new dynamoose.Condition().where('connectorId').eq(connectorId);

    switch (connectionType) {
        case 'connected': {
            queryCondition.and().where('isConnected').eq(true);
            break;
        }
        case 'pending': {
            queryCondition
                .and()
                .where('isConnected')
                .eq(false)
                .and()
                .where('connectionInitiatedBy')
                .not()
                .eq(connectorId);
            break;
        }
        case 'sent': {
            queryCondition.and().where('isConnected').eq(false).and().where('connectionInitiatedBy').eq(connectorId);
            break;
        }
        case 'all':
            break;
        default:
            throw new HttpError(ERROR_MESSAGES.USER_CONNECTIONS_QUERY_PARAM, 400, ERROR_CODES.INVALID_ERROR);
    }
    const initialQuery = Connection.scan(queryCondition);
    const connections = await fetchDynamoDBPaginatedDocuments<IConnection>(
        initialQuery,
        [],
        limit,
        ['id'],
        nextSearchStartFromKey
    );
    return connections;
};

const createCertifications = async (): Promise<ICertifications> => {
    const certifications: ICertifications = {
        id: v4(),
        certifications: Array<ICertification>(),
    };
    const certificationObj = new Certifications(certifications);
    certificationObj.save();
    return certifications;
};

const createSkills = async (): Promise<ISkills> => {
    const skills: ISkills = {
        id: v4(),
        skillSets: Array<ISkillSet>(),
    };
    const skillsObj = new Skills(skills);
    skillsObj.save();
    return skills;
};

const createSettings = async (): Promise<IUserSettings> => {
    const settings: IUserSettings = {
        id: v4(),
        display: { theme: 'light' },
        privacy: {
            location: 'public',
            dateOfBirth: 'private',
            gender: 'private',
            profilePhotos: 'public',
            email: 'public',
            phone: 'public',
        },
        visibility: {
            activeStatus: 'public',
            userBlockingInfo: [],
        },
        communications: {
            connectionInvite: 'all',
        },
        feedPreference: {
            favourites: [],
            recentOnly: false,
        },
    };
    const settingssObj = new Settings(settings);
    settingssObj.save();
    return settings;
};

const createExperiences = async (): Promise<IExperiences> => {
    const experiences: IExperiences = {
        id: v4(),
        experiences: Array<IExperience>(),
    };
    const experienceObj = new Experiences(experiences);
    experienceObj.save();
    return experiences;
};

const getSkills = async (skillsId: string): Promise<ISkills> => {
    return await Skills.get({ id: skillsId });
};

const updateSkills = async (skillsId: string, skillSets: Array<ISkillSet>): Promise<ISkills> => {
    return await Skills.update({ id: skillsId }, { skillSets: skillSets });
};

const createProjects = async (): Promise<IProjects> => {
    const projects: IProjects = {
        id: v4(),
        projects: Array<IProject>(),
    };
    const projectsObj = new Projects(projects);
    projectsObj.save();
    return projects;
};

const getExperiences = async (experiencesId: string): Promise<IExperiences> => {
    return await Experiences.get({ id: experiencesId });
};

const updateExperiences = async (experiencesId: string, experiences: Array<IExperience>): Promise<IExperiences> => {
    return await Experiences.update({ id: experiencesId }, { experiences: experiences });
};

const getCertifications = async (certificationsId: string): Promise<ICertifications> => {
    return await Certifications.get({ id: certificationsId });
};

const updateCertifications = async (
    certificationsId: string,
    certifications: Array<ICertification>
): Promise<ICertifications> => {
    return await Certifications.update({ id: certificationsId }, { certifications: certifications });
};

const getProjects = async (projectsId: string): Promise<IProjects> => {
    return await Projects.get({ id: projectsId });
};

const updateProjects = async (projectsId: string, projects: Array<IProject>): Promise<IProjects> => {
    return await Projects.update({ id: projectsId }, { projects: projects });
};

const getUserSetting = async (settingsId: string): Promise<IUserSettings> => {
    return await Settings.get({ id: settingsId });
};

const updateUserSettings = async (
    settingsId: string,
    settingsUpdateDetails: Array<ISettingsUpdateDetail>
): Promise<IUserSettings | undefined> => {
    const settings = await Settings.get({ id: settingsId });
    const settingsJson = settings.toJSON();
    settingsUpdateDetails.forEach((update) => {
        switch (update.fieldName) {
            case 'display': {
                settingsJson.display[update.fieldKey as keyof IUserSettingsDisplay] =
                    update.fieldValue as IUserSettingsDisplayOption;
                break;
            }
            case 'privacy': {
                settingsJson.privacy[update.fieldKey as keyof IUserSettingsPrivacy] =
                    update.fieldValue as IUserSettingsPrivacyOption;
                break;
            }
            case 'communications': {
                settingsJson.communications[update.fieldKey as unknown as keyof IUserSettingsCommunications] =
                    update.fieldValue as IUserSettingsCommunicationsOption;
                break;
            }
            case 'visibility': {
                if (update.fieldKey == 'activeStatus') {
                    settingsJson.visibility.activeStatus = update.fieldValue as IUserSettingsPrivacyOption;
                } else if (update.fieldOperation == 'addition') {
                    settingsJson.visibility.userBlockingInfo.push(update.fieldValue as string);
                } else {
                    const index = settingsJson.visibility.userBlockingInfo.indexOf(update.fieldValue as string);
                    if (index > -1) {
                        settingsJson.visibility.userBlockingInfo.splice(index, 1);
                    }
                }

                break;
            }
            case 'feedPreference': {
                if (!settingsJson.feedPreference) {
                    return undefined;
                }
                if (update.fieldKey == 'recentOnly') {
                    settingsJson.feedPreference.recentOnly = update.fieldValue as boolean;
                    break;
                } else if (update.fieldOperation == 'addition') {
                    settingsJson.feedPreference.favourites.push(update.fieldValue as string);
                } else {
                    const index = settingsJson.feedPreference.favourites.indexOf(update.fieldValue as string);
                    if (index > -1) {
                        settingsJson.feedPreference.favourites.splice(index, 1);
                    }
                }
            }
        }
    });
    delete settingsJson.updatedAt;
    delete settingsJson.createdAt;
    delete settingsJson.id;
    const updatedSettings = await Settings.update({ id: settingsId }, settingsJson);
    return updatedSettings;
};

const DBQueries = {
    getUserSetting,
    getConnectionById,
    getConnection,
    createUser,
    getFollow,
    getAuthUserByEmail,
    getUserById,
    getUserInfoForIds,
    updateUser,
    getUserFollowResources,
    createSkills,
    getSkills,
    updateSkills,
    searchUsersByName,
    createProjects,
    getProjects,
    updateExperiences,
    getExperiences,
    createExperiences,
    updateProjects,
    createCertifications,
    getCertifications,
    updateCertifications,
    createFeedback,
    getConnections,
    updateUserConnectionCountQuery,
    updateUserFollowCountQuery,
    updateUserSettings,
    createSettings,
};

export default DBQueries;
