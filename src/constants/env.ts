import dotenv from 'dotenv';

dotenv.config();

const ENV = {
    DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV === 'prod' ? 'prod' : 'dev',
    PORT: process.env.PORT || 3000,
    AWS: {
        KEY: process.env.AWS_KEY,
        SECRET: process.env.AWS_SECRET,
        REGION: process.env.AWS_REGION,
        S3: { BUCKET: process.env.S3_BUCKET },
        COGNITO: {
            CLIENT_DOMAIN: process.env.COGNITO_CLIENT_DOMAIN,
            ISSUER_URL: process.env.COGNITO_ISSUER_URL,
        },
    },
    MONGODB_URL: process.env.MONGODB_URL as string,
};

export default ENV;
