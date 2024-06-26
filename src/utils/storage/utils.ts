import { AWSError, S3 } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import fs from 'fs';
import { v4 } from 'uuid';
import ENV from '../../constants/env';
import { ERROR_CODES } from '../../constants/errors';
import { HttpError } from '../error';
import STORAGE_CLIENT from './client';

const uploadFileToS3 = async (
    storageFileLocation: string,
    fileLocation: string
): Promise<S3.ManagedUpload.SendData> => {
    const fileStream = fs.createReadStream(fileLocation);
    const uploadParams: S3.PutObjectRequest = {
        Body: fileStream,
        Bucket: ENV.AWS.S3.BUCKET as string,
        Key: storageFileLocation,
    };
    try {
        const upLoadedResponse = await STORAGE_CLIENT.upload(uploadParams).promise();
        return upLoadedResponse;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        throw new HttpError(err.message, 400, ERROR_CODES.UPLOAD_ERROR);
    }
};

const deleteFileFromS3 = async (
    storageFileLocation: string
): Promise<PromiseResult<S3.DeleteObjectOutput, AWSError>> => {
    const deleteParams: S3.PutObjectRequest = {
        Bucket: ENV.AWS.S3.BUCKET as string,
        Key: storageFileLocation,
    };
    try {
        const deletedResponse = await STORAGE_CLIENT.deleteObject(deleteParams).promise();
        return deletedResponse;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        throw new HttpError(err.message, 400, ERROR_CODES.NOT_FOUND_ERROR);
    }
};

const getFileFromS3 = (storageFileLocation: string): Promise<PromiseResult<S3.GetObjectOutput, AWSError>> => {
    const downLoadParams: S3.GetObjectRequest = {
        Bucket: ENV.AWS.S3.BUCKET as string,
        Key: storageFileLocation,
    };
    const fileStream = STORAGE_CLIENT.getObject(downLoadParams).promise();
    return fileStream;
};

const generateUploadURL = async (storageFileLocation: string) => {
    const generateSignedURLParams = {
        Bucket: ENV.AWS.S3.BUCKET as string,
        Key: `${storageFileLocation}_${v4()}`,
        Expires: 20,
    };
    const uploadURL = await STORAGE_CLIENT.getSignedUrlPromise('putObject', generateSignedURLParams);
    return uploadURL;
};

export { uploadFileToS3, deleteFileFromS3, getFileFromS3, generateUploadURL };
