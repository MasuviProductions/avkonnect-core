import multer from 'multer';

const fileUploadHandler = multer({ dest: 'temp/' });

export default fileUploadHandler;
