import express from 'express';
import getUser from '../controllers/users';

const USER_ROUTER = express.Router();

USER_ROUTER.route('/:id').get(getUser);

export default USER_ROUTER;
