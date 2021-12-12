import express from 'express';
import { check } from 'express-validator';
import USER_CONTROLLER from '../controllers/users';
import fileUploadHandler from '../middlewares/fileUploadHandler';
import { READABLE_USER_PROPERTIES } from '../models/user';

const USER_ROUTER = express.Router();
const userFollowingRouter = express.Router({ mergeParams: true });
const userConnectionsRouter = express.Router({ mergeParams: true });
const userSkillsRouter = express.Router({ mergeParams: true });
const userDisplayPictureRouter = express.Router({ mergeParams: true });
const userBackgroundPictureRouter = express.Router({ mergeParams: true });

USER_ROUTER.use('/:user_id/following', userFollowingRouter);
USER_ROUTER.use('/:user_id/connections', userConnectionsRouter);
USER_ROUTER.use('/:user_id/skills', userSkillsRouter);
USER_ROUTER.use('/:user_id/displayPicture', userDisplayPictureRouter);
USER_ROUTER.use('/:user_id/backgroundPicture', userBackgroundPictureRouter);

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
userDisplayPictureRouter
    .route('/')
    .get(USER_CONTROLLER.getUserDisplayPicture)
    .put(fileUploadHandler.single('displayPicture'), USER_CONTROLLER.putUserDisplayPicture)
    .delete(USER_CONTROLLER.deleteUserDisplayPicture);
userBackgroundPictureRouter
    .route('/')
    .get(USER_CONTROLLER.getUserBackgroundPicture)
    .put(fileUploadHandler.single('backgroundPicture'), USER_CONTROLLER.putUserBackgroundPicture)
    .delete(USER_CONTROLLER.deleteUserBackgroundPicture);
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
