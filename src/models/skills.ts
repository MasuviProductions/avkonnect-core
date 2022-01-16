import * as dynamoose from 'dynamoose';
import { IUserAvatar } from '../interfaces/api';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';

// Extended properties must not be present in schema
export interface ISkillEndorser extends Partial<IUserAvatar> {
    endorserId: string;
    rating: number;
    relationWithUser: string;
}
const SkillEndorser = new dynamoose.Schema({
    endorserId: { type: String },
    rating: { type: Number },
    relationWithUser: { type: String },
});

export interface ISkillSet {
    name: string;
    endorsers: Array<ISkillEndorser>;
}
const SkillSet = new dynamoose.Schema({
    name: { type: String },
    endorsers: { type: Array, schema: Array.of(SkillEndorser) },
});

export interface ISkills {
    id: string;
    skillSets: Array<ISkillSet>;
}
// Changes in SkillsSchema must be updated in ISkills
const SkillsSchema = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        skillSets: { type: Array, schema: Array.of(SkillSet) },
    },
    {
        timestamps: true,
    }
);
const Skills = dynamoose.model<IDynamooseDocument<ISkills>>(TABLE.Skills, SkillsSchema);

export default Skills;
