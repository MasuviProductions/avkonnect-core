import express from 'express';
import { getAuthUser, getUser } from '../controllers/users';

const USER_ROUTER = express.Router();

USER_ROUTER.route('/auth').get(getAuthUser);
USER_ROUTER.route('/:id').get(getUser);

export default USER_ROUTER;
