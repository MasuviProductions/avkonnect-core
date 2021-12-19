import util from 'util';
import fs from 'fs';

export const unlinkFile = util.promisify(fs.unlink);

export const deleteFiles = (fileLocations: string[]) => {
    const deleteFileArray = fileLocations.map((fileLocation) => unlinkFile(fileLocation));
    return Promise.all(deleteFileArray);
};
