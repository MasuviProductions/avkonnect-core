import express from 'express';
import { getAuthUser } from '../controllers/auth';

const AUTH_ROUTER = express.Router();

AUTH_ROUTER.route('/user').get(getAuthUser);

export default AUTH_ROUTER;
