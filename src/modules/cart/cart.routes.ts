import { Router } from 'express';
import { CartController } from './cart.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import { AddCartItemSchema, UpdateCartItemQuantitySchema } from './cart.validator';
import { ApplyCouponSchema } from '../coupons/coupon.validator';
import { asyncHandler } from '../../common/utils/async-handler';
import { authenticate } from '../../common/middlewares/auth.middleware';

const router = Router();
const controller = new CartController();

router.use(authenticate);

router.get('/', asyncHandler(controller.getCart));
router.post('/item', validateRequest({ body: AddCartItemSchema }), asyncHandler(controller.addItem));
router.put('/item', validateRequest({ body: UpdateCartItemQuantitySchema }), asyncHandler(controller.updateQuantity));
router.delete('/item/:id', asyncHandler(controller.removeItem));
router.delete('/clear', asyncHandler(controller.clearCart));
router.post('/coupon', validateRequest({ body: ApplyCouponSchema }), asyncHandler(controller.applyCoupon));
router.delete('/coupon', asyncHandler(controller.removeCoupon));

export const cartRoutes = router;
