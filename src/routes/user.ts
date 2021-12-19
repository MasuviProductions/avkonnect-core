import express from 'express';
import { check } from 'express-validator';
import USER_CONTROLLER from '../controllers/users';
import { READABLE_USER_PROPERTIES } from '../models/user';

const USER_ROUTER = express.Router();
const userFollowingRouter = express.Router({ mergeParams: true });
const userConnectionsRouter = express.Router({ mergeParams: true });
const userSkillsRouter = express.Router({ mergeParams: true });
const userSignedURLRouter = express.Router({ mergeParams: true });

USER_ROUTER.use('/:user_id/following', userFollowingRouter);
USER_ROUTER.use('/:user_id/connections', userConnectionsRouter);
USER_ROUTER.use('/:user_id/skills', userSkillsRouter);

USER_ROUTER.use('/:user_id/signedURL', userSignedURLRouter);

userFollowingRouter
    .route('/:following_id')
    .post(USER_CONTROLLER.postFollowingForUser)
    .delete(USER_CONTROLLER.deleteFollowingForUser);
userConnectionsRouter
    .route('/:connection_id')
    .post(USER_CONTROLLER.postCreateConnectionForUser)
    .patch(USER_CONTROLLER.patchConfirmConnectionForUser)
    .delete(USER_CONTROLLER.deleteConnectionForUser);
userSkillsRouter
    .route('/')
    .patch([check('skill').exists()], USER_CONTROLLER.patchEndorseUserSkill)
    .delete([check('skill').exists()], USER_CONTROLLER.deleteUnendorseUserSkill);
userSignedURLRouter.route('/').get(USER_CONTROLLER.getUserUploadSignedURL);

USER_ROUTER.route('/:user_id')
    .get(USER_CONTROLLER.getUserProfile)
    .patch(
        [
            check(READABLE_USER_PROPERTIES as unknown as string[])
                .not()
                .exists(),
        ],
        USER_CONTROLLER.patchUserProfile
    );

export default USER_ROUTER;
