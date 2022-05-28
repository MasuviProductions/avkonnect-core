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
        NOTIFICATIONS_SQS_URL: process.env.AWS_NOTIFICATIONS_SQS_URL || '',
    },
    MONGODB_URL: process.env.MONGODB_URL as string,
};

export default ENV;
