import express from 'express';
import { deleteFollowingForUser, getUserProfile, postFollowingForUser } from '../controllers/users';

const USER_ROUTER = express.Router();

const userFollowingRouter = express.Router({ mergeParams: true });
USER_ROUTER.use('/:user_id/following', userFollowingRouter);
userFollowingRouter.route('/:following_id').post(postFollowingForUser).delete(deleteFollowingForUser);

const userConnectionsRouter = express.Router({ mergeParams: true });
USER_ROUTER.use('/:user_id/connections', userConnectionsRouter);
userConnectionsRouter.route('/:connection_id').post().delete();

USER_ROUTER.route('/:user_id').get(getUserProfile);

export default USER_ROUTER;
