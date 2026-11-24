import { Router } from 'express';
import { LocationController } from './location.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import { ServiceabilityCheckSchema, ReverseGeocodeSchema } from './location.validator';
import { asyncHandler } from '../../common/utils/async-handler';

const router = Router();
const controller = new LocationController();

router.post(
  '/serviceability',
  validateRequest({ body: ServiceabilityCheckSchema }),
  asyncHandler(controller.checkServiceability)
);

router.post(
  '/reverse-geocode',
  validateRequest({ body: ReverseGeocodeSchema }),
  asyncHandler(controller.reverseGeocode)
);

export const locationRoutes = router;
