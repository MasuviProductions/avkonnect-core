import * as dynamoose from 'dynamoose';
import { IUserAvatar } from '../interfaces/api';
import { TABLE } from '../constants/db';
import { IDynamooseDocument } from '../interfaces/generic';

export interface IProject {
    companyName: string;
    collaboratorsRefs: Array<string>;
    description: string;
    employmentType: string;
    endDate: number;
    industry: string;
    name: string;
    role: string;
    startDate: number;
    // Below properties must not be present in schema
    collaborators?: Array<IUserAvatar>;
}
const ProjectSchema = new dynamoose.Schema({
    companyName: { type: String },
    collaboratorsRefs: { type: Array, schema: Array.of(String) },
    description: { type: String },
    employmentType: { type: String }, //TODO:declare enum
    endDate: { type: Number },
    industry: { type: String }, //TODO:declare enum
    name: { type: String },
    role: { type: String },
    startDate: { type: Number },
});
export interface IProjects {
    id: string;
    projects: Array<IProject>;
}
// Changes in ProjectsSchema must be updated in IProjects
const ProjectsSchema = new dynamoose.Schema(
    {
        id: { type: String, hashKey: true },
        projects: { type: Array, schema: Array.of(ProjectSchema) },
    },
    {
        timestamps: true,
    }
);
const Projects = dynamoose.model<IDynamooseDocument<IProjects>>(TABLE.PROJECTS, ProjectsSchema);

export default Projects;
