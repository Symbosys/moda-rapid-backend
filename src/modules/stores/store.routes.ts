import { Router } from 'express';
import { StoreController } from './store.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import { NearbyStoresQuerySchema } from './store.validator';
import { asyncHandler } from '../../common/utils/async-handler';

const router = Router();
const controller = new StoreController();

router.get(
  '/nearby',
  validateRequest({ query: NearbyStoresQuerySchema }),
  asyncHandler(controller.getNearbyStores)
);

router.get('/:id', asyncHandler(controller.getStoreDetails));

export const storeRoutes = router;
