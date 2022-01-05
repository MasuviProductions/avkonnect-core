import * as dynamoose from 'dynamoose';
import { v4 } from 'uuid';
import Skills, { ISkills, ISkillSet } from '../../models/skills';
import Connection, { IConnection } from '../../models/connection';
import Follow, { IFollow } from '../../models/follow';
import User, { IEditableUser, IUser } from '../../models/user';
import { IFollowResourceValues } from './helpers';
import { ObjectType } from 'dynamoose/dist/General';
import { HttpDDBResponsePagination } from '../../interfaces/generic';

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

const getUserInfoForIds = async (idList: Set<string>): Promise<Array<Partial<IUser>>> => {
    const usersDocuments = await User.scan(new dynamoose.Condition('id').in(Array.from(idList)))
        .attributes(['id', 'name', 'headline', 'displayPictureUrl'])
        .exec();
    return usersDocuments as Array<Partial<IUser>>;
};

const DYNAMODB_USER_SEARCH_SCAN_LIMIT = 15;

// const getUsers = async (cb: () => void) => {
// const scanUser = User.scan(
//     new dynamoose.Condition().filter('searchFields.name').beginsWith(decodeURI(searchString.toLowerCase()))
// ).consistent();
// if (startSearchFromId) {
//     scanUser.startAt(startSearchFromId);
// }
// const searchedUsers = await scanUser
//     .limit(DYNAMODB_USER_SEARCH_SCAN_LIMIT)
//     .attributes(['id', 'name', 'headline', 'displayPictureUrl'])
//     .exec();
// startSearchFromId = searchedUsers.lastKey;
// (searchedUsers as Array<Partial<IUser>>).forEach((searchedUser) => {
//     users.push(searchedUser);
// });

//     await cb();
// };

// const functionHandler = async () => {
//     if (users.length >= limit || !startSearchKey) {
//         console.log('Terminate');
//     } else {
//         await getUsers(functionHandler);
//     }
// };

// await getUsers(functionHandler);

const searchUsersByName = async (
    searchString: string,
    limit: number,
    dDBAssistStartFromId?: string
): Promise<{ users: Array<Partial<IUser>>; dDBPagination: HttpDDBResponsePagination }> => {
    let startSearchFromId: ObjectType | undefined = dDBAssistStartFromId ? { id: dDBAssistStartFromId } : undefined;
    let users: Array<Partial<IUser>> = [];
    const fetchSearchUsers = async () => {
        do {
            const scanUser = User.scan(
                new dynamoose.Condition().filter('searchFields.name').beginsWith(decodeURI(searchString.toLowerCase()))
            ).consistent();
            if (startSearchFromId) {
                scanUser.startAt(startSearchFromId);
            }
            const searchedUsers = await scanUser
                .limit(DYNAMODB_USER_SEARCH_SCAN_LIMIT)
                .attributes(['id', 'name', 'headline', 'displayPictureUrl'])
                .exec();
            startSearchFromId = searchedUsers.lastKey;
            (searchedUsers as Array<Partial<IUser>>).forEach((searchedUser) => {
                users.push(searchedUser);
            });
        } while (users.length < limit && startSearchFromId);
        return users;
    };
    await fetchSearchUsers();

    let nextSearchStartFromId: string | undefined = startSearchFromId?.id;
    if (limit < users.length) {
        users = [...users.slice(0, limit)];
        nextSearchStartFromId = users?.[users.length - 1]?.id as string;
    }
    const dDBPagination: HttpDDBResponsePagination = {
        nextSearchStartFromId,
        count: users.length,
    };
    return { users, dDBPagination };
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
    searchUsersByName,
};

export default DBQueries;
