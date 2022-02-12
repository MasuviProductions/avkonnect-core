import ENV from './env';

export const TABLE = {
    CONNECTIONS: `avk-${ENV.DEPLOYMENT_ENV}-connections`,
    FOLLOWS: `avk-${ENV.DEPLOYMENT_ENV}-follows`,
    USERS: `avk-${ENV.DEPLOYMENT_ENV}-users`,
    SKILLS: `avk-${ENV.DEPLOYMENT_ENV}-skills`,
    PROJECTS: `avk-${ENV.DEPLOYMENT_ENV}-projects`,
    EXPERIENCES: `avk-${ENV.DEPLOYMENT_ENV}-experiences`,
    CERTIFICATIONS: `avk-${ENV.DEPLOYMENT_ENV}-certifications`,
    FEEDBACKS: `avk-${ENV.DEPLOYMENT_ENV}-feedbacks`,
};
