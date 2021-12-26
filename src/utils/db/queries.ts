import * as dynamoose from 'dynamoose';
import { v4 } from 'uuid';
import Skills, { ISkills, ISkillSet } from '../../models/skills';
import Connection, { IConnection } from '../../models/connection';
import Follow, { IFollow } from '../../models/follow';
import User, { IEditableUser, IUser } from '../../models/user';
import { IFollowResourceValues } from './helpers';
import { IUserRecordObj } from '../../interfaces/api';

const getAuthUserByEmail = async (email: string): Promise<IUser> => {
    const userDocuments = await User.scan({
        email: email,
    })
        .attributes(['id', 'email'])
        .exec();
    return userDocuments[0];
};

const getUserById = async (id: string): Promise<IUser> => {
    const userDocument = await User.get({
        id: id,
    });
    return userDocument;
};

const getUserInfoForIds = async (idList: Set<string>): Promise<Record<string, IUserRecordObj>> => {
    const usersDocuments = await User.scan(new dynamoose.Condition('id').in(Array.from(idList)))
        // .attributes(['id', 'name'])
        .exec();
    const userObj: Record<string, IUserRecordObj> = {};
    usersDocuments?.forEach((user) => {
        console.log(user);
        userObj[user.id as string] = { name: user.name as string };
    });
    return userObj;
};

const createUser = async (user: IUser): Promise<IUser> => {
    const myUser = new User(user);
    await myUser.save();
    return user;
};

const updateUser = async (userId: string, user: IEditableUser): Promise<IUser> => {
    return await User.update({ id: userId }, { ...user });
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

const createSkills = async (): Promise<ISkills> => {
    const skills: ISkills = {
        id: v4(),
        skillSets: Array<ISkillSet>(),
    };
    const skillsObj = new Skills(skills);
    skillsObj.save();
    return skills;
};

const getSkills = async (skillsId: string): Promise<ISkills> => {
    return await Skills.get({ id: skillsId });
};

const updateSkills = async (skillsId: string, skillSets: Array<ISkillSet>): Promise<ISkills> => {
    return await Skills.update({ id: skillsId }, { skillSets: skillSets });
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
};

export default DBQueries;
