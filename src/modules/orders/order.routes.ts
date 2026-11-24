import { Router } from 'express';
import { OrderController } from './order.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import { CreateOrderSchema, CancelOrderSchema, ReturnOrderSchema } from './order.validator';
import { asyncHandler } from '../../common/utils/async-handler';
import { authenticate } from '../../common/middlewares/auth.middleware';

const router = Router();
const controller = new OrderController();

router.use(authenticate);

router.post('/create', validateRequest({ body: CreateOrderSchema }), asyncHandler(controller.createOrder));
router.get('/', asyncHandler(controller.getUserOrders));
router.post('/return/create', validateRequest({ body: ReturnOrderSchema }), asyncHandler(controller.requestReturn));
router.get('/:id', asyncHandler(controller.getOrderDetails));
router.post('/:id/advance-status', asyncHandler(controller.advanceOrderStatus));
router.post('/:id/cancel', validateRequest({ body: CancelOrderSchema }), asyncHandler(controller.cancelOrder));
router.post('/:id/return', validateRequest({ body: ReturnOrderSchema }), asyncHandler(controller.requestReturn));

export const orderRoutes = router;
