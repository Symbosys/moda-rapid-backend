import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import { InitiatePaymentSchema, VerifyPaymentSchema } from './payment.validator';
import { asyncHandler } from '../../common/utils/async-handler';
import { authenticate } from '../../common/middlewares/auth.middleware';

const router = Router();
const controller = new PaymentController();

// Public webhook route (signature verified in controller)
router.post('/webhook', asyncHandler(controller.handleWebhook));

// Bank directory for Net Banking
router.get('/netbanking/banks', asyncHandler(controller.getNetBankingBanks));

// Authenticated payment operations
router.use(authenticate);

router.post(
  '/initiate',
  validateRequest({ body: InitiatePaymentSchema }),
  asyncHandler(controller.initiatePayment)
);

router.post(
  '/verify',
  validateRequest({ body: VerifyPaymentSchema }),
  asyncHandler(controller.verifyPayment)
);

export const paymentRoutes = router;
