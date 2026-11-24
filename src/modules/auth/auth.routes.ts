import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import { authRateLimiter } from '../../common/middlewares/rate-limiter.middleware';
import { RequestOtpSchema, VerifyOtpSchema, RefreshTokenSchema } from './auth.validator';
import { asyncHandler } from '../../common/utils/async-handler';
import { authenticate } from '../../common/middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post(
  '/otp/request',
  authRateLimiter,
  validateRequest({ body: RequestOtpSchema }),
  asyncHandler(controller.requestOtp)
);

router.post(
  '/otp/verify',
  validateRequest({ body: VerifyOtpSchema }),
  asyncHandler(controller.verifyOtp)
);

router.post(
  '/token/refresh',
  validateRequest({ body: RefreshTokenSchema }),
  asyncHandler(controller.refreshToken)
);

router.post(
  '/logout',
  authenticate,
  asyncHandler(controller.logout)
);

export const authRoutes = router;
