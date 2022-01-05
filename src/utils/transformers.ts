import { IUser } from '../models/user';
import { IUserRecordObj } from '../interfaces/api';
import { ISkills } from '../models/skills';
import DBQueries from './db/queries';

export const getSkillSetWithUserNames = async (userSkills: ISkills): Promise<ISkills> => {
    const endorsersList = new Set<string>();
    userSkills.skillSets.forEach((skillSet) =>
        skillSet.endorsers.forEach((endorser) => {
            endorsersList.add(endorser.endorserId);
        })
    );
    if (endorsersList.size > 0) {
        const userList = await DBQueries.getUserInfoForIds(endorsersList);
        const endorsersInfo = getUserInfoInKeyValuePairs(userList);
        userSkills.skillSets.forEach((skillSet) =>
            skillSet.endorsers.forEach((endorser) => {
                endorser.name = endorsersInfo[endorser.endorserId].name;
                endorser.displayPictureUrl = endorsersInfo[endorser.endorserId].displayPictureUrl;
                endorser.headline = endorsersInfo[endorser.endorserId].headline;
            })
        );
    }
    return userSkills;
};

export const getUserInfoInKeyValuePairs = (users: Array<Partial<IUser>>): Record<string, IUserRecordObj> => {
    const userObj: Record<string, IUserRecordObj> = {};
    users?.forEach((user) => {
        userObj[user.id as string] = {
            id: user.id as string,
            name: user.name as string,
            headline: user.headline || '',
            displayPictureUrl: user.displayPictureUrl || '',
        };
    });
    return userObj;
};
