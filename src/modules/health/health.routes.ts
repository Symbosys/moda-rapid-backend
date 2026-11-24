import { Router } from 'express';
import { HealthController } from './health.controller';
import { asyncHandler } from '../../common/utils/async-handler';

const router = Router();

router.get('/', asyncHandler(HealthController.getHealth));


export const healthRoutes = router;
