import { Router } from 'express';
import { TrackingController } from './tracking.controller';
import { asyncHandler } from '../../common/utils/async-handler';
import { optionalAuthenticate } from '../../common/middlewares/auth.middleware';

const router = Router();
const controller = new TrackingController();

router.use(optionalAuthenticate);

router.get('/:orderId', asyncHandler(controller.getTrackingStatus));

export const trackingRoutes = router;
