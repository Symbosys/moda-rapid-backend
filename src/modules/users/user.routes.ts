import { Router } from 'express';
import { UserController } from './user.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import { UpdateUserProfileSchema } from './user.validator';
import { asyncHandler } from '../../common/utils/async-handler';
import { authenticate } from '../../common/middlewares/auth.middleware';

const router = Router();
const controller = new UserController();

router.use(authenticate);

router.get('/profile', asyncHandler(controller.getProfile));
router.put('/profile', validateRequest({ body: UpdateUserProfileSchema }), asyncHandler(controller.updateProfile));
router.put('/profile/update', validateRequest({ body: UpdateUserProfileSchema }), asyncHandler(controller.updateProfile));

export const userRoutes = router;
