import dotenv from 'dotenv';

dotenv.config();

const ENV = {
    DEPLOYMENT_ENV: process.env.DEPLOYMENT_ENV || 'dev',
    PORT: process.env.PORT || 3000,
};

export default ENV;
