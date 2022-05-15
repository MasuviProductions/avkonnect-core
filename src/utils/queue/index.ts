import AWS from 'aws-sdk';
import ENV from '../../constants/env';

const SQS_QUEUE = new AWS.SQS({ region: ENV.AWS.REGION });

export default SQS_QUEUE;
