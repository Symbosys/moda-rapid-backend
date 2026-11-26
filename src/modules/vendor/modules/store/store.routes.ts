import { Router } from 'express';
import { VendorStoreController } from './store.controller';
import { validateRequest } from '../../../../common/middlewares/validate.middleware';
import { CreateVendorStoreSchema, UpdateVendorStoreSchema, ToggleStoreStatusSchema } from './store.validator';
import { asyncHandler } from '../../../../common/utils/async-handler';
import { authenticate } from '../../../../common/middlewares/auth.middleware';

const router = Router();
const controller = new VendorStoreController();

router.use(authenticate);

router.post('/', validateRequest({ body: CreateVendorStoreSchema }), asyncHandler(controller.createStore));
router.get('/', asyncHandler(controller.getMyStore));
router.put('/:id', validateRequest({ body: UpdateVendorStoreSchema }), asyncHandler(controller.updateStore));
router.patch('/:id/toggle-status', validateRequest({ body: ToggleStoreStatusSchema }), asyncHandler(controller.toggleStoreStatus));

export const vendorStoreRoutes = router;
