import dotenv from 'dotenv';

dotenv.config();

const ENV = {
    DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV || 'dev',
    PORT: process.env.PORT || 3000,
    AWS: {
        KEY: process.env.AWS_KEY,
        SECRET: process.env.AWS_SECRET,
        REGION: process.env.AWS_REGION,
    },
};

export default ENV;
