import { Router } from 'express';
import { CouponController } from './coupon.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import { ApplyCouponSchema } from './coupon.validator';
import { asyncHandler } from '../../common/utils/async-handler';

const router = Router();
const controller = new CouponController();

router.get('/', asyncHandler(controller.getAvailableCoupons));
router.post('/apply', validateRequest({ body: ApplyCouponSchema }), asyncHandler(controller.applyCoupon));

export const couponRoutes = router;
