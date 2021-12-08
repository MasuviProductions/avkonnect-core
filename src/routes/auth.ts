import express from 'express';
import AUTH_CONTROLLER from '../controllers/auth';

const AUTH_ROUTER = express.Router();
AUTH_ROUTER.route('/user').get(AUTH_CONTROLLER.getAuthUser);

export default AUTH_ROUTER;
