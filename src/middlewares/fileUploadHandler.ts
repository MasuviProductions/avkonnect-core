import multer from 'multer';

const fileUploadHandler = multer({ dest: './tmp/' });

export default fileUploadHandler;
