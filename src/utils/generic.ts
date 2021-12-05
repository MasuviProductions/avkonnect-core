import util from 'util';
import fs from 'fs';

export const unlinkFile = util.promisify(fs.unlink);
