import express from 'express';
import { body, check } from 'express-validator';
import USER_CONTROLLER from '../controllers/users';
import { READABLE_USER_PROPERTIES } from '../models/user';

const USER_ROUTER = express.Router();
const userFollowingRouter = express.Router({ mergeParams: true });
const userConnectionsRouter = express.Router({ mergeParams: true });
const userSkillsRouter = express.Router({ mergeParams: true });
const userProjectsRouter = express.Router({ mergeParams: true });
const userSignedURLRouter = express.Router({ mergeParams: true });
const userExperiencesRouter = express.Router({ mergeParams: true });
const userCertificationsRouter = express.Router({ mergeParams: true });
const userFeedbackRouter = express.Router({ mergeParams: true });

USER_ROUTER.use('/:user_id/followee', userFollowingRouter);
USER_ROUTER.use('/:user_id/connections', userConnectionsRouter);
USER_ROUTER.use('/:user_id/skills', userSkillsRouter);
USER_ROUTER.use('/:user_id/projects', userProjectsRouter);
USER_ROUTER.use('/:user_id/signedURL', userSignedURLRouter);
USER_ROUTER.use('/:user_id/experiences', userExperiencesRouter);
USER_ROUTER.use('/:user_id/certifications', userCertificationsRouter);
USER_ROUTER.use('/:user_id/feedback', userFeedbackRouter);

userFeedbackRouter.route('/').post(USER_CONTROLLER.postUserFeedback);

userFollowingRouter
    .route('/:followee_id')
    .post(USER_CONTROLLER.postFollowingForUser)
    .delete(USER_CONTROLLER.deleteFollowingForUser);

userConnectionsRouter.route('/').get(USER_CONTROLLER.getConnectionsForUser);
userConnectionsRouter
    .route('/:connectee_id')
    .get(USER_CONTROLLER.getConnectionForUser)
    .post(USER_CONTROLLER.postCreateConnectionForUser)
    .patch(USER_CONTROLLER.patchConfirmConnectionForUser)
    .delete(USER_CONTROLLER.deleteConnectionForUser);

userSkillsRouter.route('/').get(USER_CONTROLLER.getUserSkills).put([body().isArray()], USER_CONTROLLER.putUserSkills);

userCertificationsRouter
    .route('/')
    .get(USER_CONTROLLER.getUserCertifications)
    .put([body().isArray()], USER_CONTROLLER.putUserCertifications);

userProjectsRouter
    .route('/')
    .get(USER_CONTROLLER.getUserProjects)
    .put([body().isArray()], USER_CONTROLLER.putUserProjects);

userExperiencesRouter
    .route('/')
    .get(USER_CONTROLLER.getUserExperiences)
    .put([body().isArray()], USER_CONTROLLER.putUserExperiences);

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

USER_ROUTER.route('/').get(USER_CONTROLLER.getUserSearch);

export default USER_ROUTER;
