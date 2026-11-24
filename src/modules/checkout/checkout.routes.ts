import { Router } from 'express';
import { CheckoutController } from './checkout.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import { CheckoutValidateSchema } from './checkout.validator';
import { asyncHandler } from '../../common/utils/async-handler';
import { authenticate } from '../../common/middlewares/auth.middleware';

const router = Router();
const controller = new CheckoutController();

router.use(authenticate);

router.post('/validate', validateRequest({ body: CheckoutValidateSchema }), asyncHandler(controller.validate));

export const checkoutRoutes = router;
