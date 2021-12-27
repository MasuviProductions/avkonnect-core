import express from 'express';
import { body, check } from 'express-validator';
import USER_CONTROLLER from '../controllers/users';
import { READABLE_USER_PROPERTIES } from '../models/user';

const USER_ROUTER = express.Router();
const userFollowingRouter = express.Router({ mergeParams: true });
const userConnectionsRouter = express.Router({ mergeParams: true });
const userSkillsRouter = express.Router({ mergeParams: true });
const userSignedURLRouter = express.Router({ mergeParams: true });
const userFollowersRouter = express.Router({ mergeParams: true });
const userFolloweesRouter = express.Router({ mergeParams: true });

USER_ROUTER.use('/:user_id/followee', userFollowingRouter);
USER_ROUTER.use('/:user_id/connectee', userConnectionsRouter);
USER_ROUTER.use('/:user_id/skills', userSkillsRouter);
USER_ROUTER.use('/:user_id/signedURL', userSignedURLRouter);
USER_ROUTER.use('/:user_id/followers', userFollowersRouter); //TODO : need to check this route for multiple values of followees
USER_ROUTER.use('/:user_id/followees', userFolloweesRouter); //TODO : need to check this route for multiple values of followers

userFolloweesRouter.route('/').get(USER_CONTROLLER.getFolloweesList);

userFollowersRouter.route('/').get(USER_CONTROLLER.getFollowersList);

userFollowingRouter
    .route('/:followee_id')
    .post(USER_CONTROLLER.postFollowingForUser)
    .delete(USER_CONTROLLER.deleteFollowingForUser);
userConnectionsRouter
    .route('/:connectee_id')
    .post(USER_CONTROLLER.postCreateConnectionForUser)
    .patch(USER_CONTROLLER.patchConfirmConnectionForUser)
    .delete(USER_CONTROLLER.deleteConnectionForUser);
userSkillsRouter
    .route('/')
    .get(USER_CONTROLLER.getUserSkills)
    .patch([body().isArray()], USER_CONTROLLER.patchUserSkill);

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
