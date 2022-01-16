import { IUser } from '../models/user';
import { IUserAvatar } from '../interfaces/api';
import { ISkills } from '../models/skills';
import DBQueries from './db/queries';
import { IProjects } from '../models/projects';

export const getExpandedUserSkillSetEndorsers = async (userSkills: ISkills): Promise<ISkills> => {
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

export const getExpandedProjectCollaborators = async (userProjcts: IProjects): Promise<IProjects> => {
    const collaboratorsList = new Set<string>();
    userProjcts.projects.forEach((project) =>
        project.collaboratorsRefs.forEach((collaboratorId) => {
            collaboratorsList.add(collaboratorId);
        })
    );
    if (collaboratorsList.size > 0) {
        const userList = await DBQueries.getUserInfoForIds(collaboratorsList);
        const collaboratorsInfo = getUserInfoInKeyValuePairs(userList);
        userProjcts.projects.forEach((project) => {
            project.collaborators = [];

            project.collaboratorsRefs.forEach((collaboratorId) => {
                project.collaborators?.push(collaboratorsInfo[collaboratorId]);
            });
        });
    }
    return userProjcts;
};

export const getUserInfoInKeyValuePairs = (users: Array<Partial<IUser>>): Record<string, IUserAvatar> => {
    const userObj: Record<string, IUserAvatar> = {};
    users?.forEach((user) => {
        userObj[user.id as string] = {
            id: user.id as string,
            name: user.name as string,
            headline: user.headline || '',
            displayPictureUrl: user.displayPictureUrl || '',
            email: user.email as string,
        };
    });
    return userObj;
};
