import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { asyncHandler } from '../../common/utils/async-handler';
import { optionalAuthenticate } from '../../common/middlewares/auth.middleware';

const router = Router();
const controller = new NotificationController();

router.use(optionalAuthenticate);

router.get('/', asyncHandler(controller.getNotifications));

export const notificationRoutes = router;
