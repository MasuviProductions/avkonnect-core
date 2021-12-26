import { ISkills } from '../../models/skills';
import DBQueries from './queries';

export const getSkillSetWithUserNames = async (userSkills: ISkills): Promise<ISkills> => {
    const endorsersList = new Set<string>();
    userSkills.skillSets.forEach((skillSet) =>
        skillSet.endorsers.forEach((endorser) => {
            endorsersList.add(endorser.endorserId);
        })
    );
    if (endorsersList.size > 0) {
        const endorsersInfo = await DBQueries.getUserInfoForIds(endorsersList);
        userSkills.skillSets.forEach((skillSet) =>
            skillSet.endorsers.forEach((endorser) => {
                endorser.name = endorsersInfo[endorser.endorserId].name;
            })
        );
    }
    return userSkills;
};
