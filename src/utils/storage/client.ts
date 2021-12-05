import { S3 } from 'aws-sdk';
import ENV from '../../constants/env';

const STORAGE_CLIENT = new S3({
    region: ENV.AWS.REGION,
    accessKeyId: ENV.AWS.KEY,
    secretAccessKey: ENV.AWS.SECRET,
});

export default STORAGE_CLIENT;
