import util from 'util';
import fs from 'fs';
import sharp from 'sharp';
import { uploadFileToS3 } from './storage/utils';
import { IImageResolution } from '../interfaces/generic';

export const unlinkFile = util.promisify(fs.unlink);

export const deleteFiles = (fileLocations: string[]) => {
    const deleteFileArray = fileLocations.map((fileLocation) => unlinkFile(fileLocation));
    return Promise.all(deleteFileArray);
};

export const handleDisplayPictureUpload = async (
    originalFilePath: string,
    resizeTempLocation: string,
    storageLocation: string,
    imageResolution: IImageResolution,
    deleteOriginalFile = false
) => {
    await sharp(originalFilePath).resize(imageResolution.width, imageResolution.height).toFile(resizeTempLocation);
    const uploadedFileResponse = await uploadFileToS3(storageLocation, resizeTempLocation);
    if (deleteOriginalFile) {
        await unlinkFile(originalFilePath);
    }
    await unlinkFile(resizeTempLocation);
    return uploadedFileResponse;
};
