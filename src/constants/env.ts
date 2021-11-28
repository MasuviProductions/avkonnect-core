import dotenv from 'dotenv';

dotenv.config();

const ENV = {
    DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV || 'dev',
    PORT: process.env.PORT || 3000,
    AWS: {
        KEY: process.env.AWS_KEY,
        SECRET: process.env.AWS_SECRET,
        REGION: process.env.AWS_REGION,
        COGNITO: {
            CLIENT_DOMAIN: process.env.COGNITO_CLIENT_DOMAIN,
            ISSUER_URL: process.env.COGNITO_ISSUER_URL,
        },
    },
};

export default ENV;
