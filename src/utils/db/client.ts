import dynamoose from 'dynamoose';
import ENV from '../../constants/env';

console.log('Dynamoose settings', ENV.AWS.SECRET, ENV.AWS.KEY, ENV.AWS.REGION);

const initDynamoDB = () => {
    const DYNAMOOSE_CLIENT = new dynamoose.aws.sdk.DynamoDB({
        region: ENV.AWS.REGION,
        accessKeyId: ENV.AWS.KEY,
        secretAccessKey: ENV.AWS.SECRET,
    });
    dynamoose.aws.ddb.set(DYNAMOOSE_CLIENT);
};

export default initDynamoDB;
