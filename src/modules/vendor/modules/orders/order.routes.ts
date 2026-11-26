import { Router } from 'express';
import { VendorOrderController } from './order.controller';
import { validateRequest } from '../../../../common/middlewares/validate.middleware';
import { UpdateVendorOrderStatusSchema, VendorOrderQuerySchema } from './order.validator';
import { asyncHandler } from '../../../../common/utils/async-handler';
import { authenticate } from '../../../../common/middlewares/auth.middleware';

const router = Router();
const controller = new VendorOrderController();

router.use(authenticate);

router.get('/', validateRequest({ query: VendorOrderQuerySchema }), asyncHandler(controller.getStoreOrders));
router.get('/:id', asyncHandler(controller.getOrderDetails));
router.patch('/:id/status', validateRequest({ body: UpdateVendorOrderStatusSchema }), asyncHandler(controller.updateOrderStatus));

export const vendorOrderRoutes = router;
