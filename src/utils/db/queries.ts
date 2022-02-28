import * as dynamoose from 'dynamoose';
import { v4 } from 'uuid';
import Skills, { ISkills, ISkillSet } from '../../models/skills';
import Connection, { IConnection } from '../../models/connection';
import Follow, { IFollow } from '../../models/follow';
// import User, { IEditableUser, IUser } from '../../models/user';
import { IFollowResourceValues } from './helpers';
// import { HttpDDBResponsePagination } from '../../interfaces/generic';
import Projects, { IProject, IProjects } from '../../models/projects';
import Experiences, { IExperience, IExperiences } from '../../models/experience';
import Certifications, { ICertifications, ICertification } from '../../models/certifications';
import Feedback, { IFeedback } from '../../models/feedbacks';
import User, { IUser, IEditableUser } from '../../models/user';

// const mongopost = async (data: string): Promise<IComment> => {
//     const mongo = await Comment.find({ userId: data })
//         .exec();
//     return mongo;
// };

//x
const getAuthUserByEmail = async (email: string): Promise<IUser> => {
    const userDocuments = await User.findOne({
        email: email,
    })
        // .attributes(['id', 'email'])
        .exec();
    return userDocuments as IUser;
};
//x
const getUserById = async (id: string): Promise<IUser> => {
    const userDocument = await User.findOne({
        id: id,
    });
    return userDocument as IUser;
};
//x
const getUserInfoForIds = async (idList: Set<string>): Promise<Array<Partial<IUser>>> => {
    const usersDocuments = await User.find(idList)
        // .attributes(['id', 'name', 'headline', 'displayPictureUrl', 'email', 'location', 'gender'])
        .exec();
    return usersDocuments as Array<Partial<IUser>>;
};
//x
// const searchUsersByName = async (
//     searchString: string,
//     limit: number,
//     dDBAssistStartFromId?: string
// ): Promise<{ users: Array<Partial<IUser>>; dDBPagination: HttpDDBResponsePagination }> => {
//     const scanInitialUser = User.scan(
//         new dynamoose.Condition().filter('searchFields.name').beginsWith(decodeURI(searchString.toLowerCase()))
//     );
//     const { documents, dDBPagination } = await fetchDDBPaginatedDocuments<IUser>(
//         scanInitialUser,
//         ['id', 'name', 'headline', 'displayPictureUrl'],
//         limit,
//         dDBAssistStartFromId
//     );
//     return { users: documents, dDBPagination };
// };

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
//x
const createUser = async (user: IUser): Promise<IUser> => {
    const myUser = new User(user);
    await myUser.save();
    return user;
};
//x
const updateUser = async (userId: string, user: IEditableUser): Promise<IUser> => {
    const data = await User.findByIdAndUpdate({ id: { $eq: userId } }, user);
    return data as IUser;
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

const getConnection = async (connectorId: string, connecteeId: string): Promise<IConnection> => {
    const connections = await Connection.scan(
        new dynamoose.Condition().where('connectorId').eq(connectorId).and().where('connecteeId').eq(connecteeId)
    ).exec();
    return connections[0];
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

const DBQueries = {
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
    // searchUsersByName,
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
    // mongopost,
};

export default DBQueries;
