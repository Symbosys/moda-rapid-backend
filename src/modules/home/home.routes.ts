import { Router } from 'express';
import { HomeController } from './home.controller';
import { asyncHandler } from '../../common/utils/async-handler';

const router = Router();
const controller = new HomeController();

router.get('/feed', asyncHandler(controller.getHomeFeed));
router.get('/banners', asyncHandler(controller.getBanners));

export const homeRoutes = router;
