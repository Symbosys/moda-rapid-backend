import { Router } from 'express';
import { VendorController } from './vendor.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import {
  RegisterVendorSchema,
  LoginVendorSchema,
  RequestVendorOtpSchema,
  VerifyVendorOtpSchema,
} from './vendor.validator';
import { asyncHandler } from '../../common/utils/async-handler';
import { authenticate } from '../../common/middlewares/auth.middleware';

// Sub-modules
import { vendorStoreRoutes } from './modules/store/store.routes';
import { vendorProductRoutes } from './modules/products/product.routes';
import { vendorKycRoutes } from './modules/kyc/kyc.routes';
import { vendorOrderRoutes } from './modules/orders/order.routes';

const router = Router();
const controller = new VendorController();

// 1. Vendor Public Auth Routes (Mobile Number + OTP)
router.post('/request-otp', validateRequest({ body: RequestVendorOtpSchema }), asyncHandler(controller.requestOtp));
router.post('/verify-otp', validateRequest({ body: VerifyVendorOtpSchema }), asyncHandler(controller.verifyOtp));
router.post('/auth/request-otp', validateRequest({ body: RequestVendorOtpSchema }), asyncHandler(controller.requestOtp));
router.post('/auth/verify-otp', validateRequest({ body: VerifyVendorOtpSchema }), asyncHandler(controller.verifyOtp));

// Backward compatibility for standard login/registration
router.post('/register', validateRequest({ body: RegisterVendorSchema }), asyncHandler(controller.register));
router.post('/login', validateRequest({ body: LoginVendorSchema }), asyncHandler(controller.login));

// 2. Vendor Authenticated Profile & Dashboard
router.get('/profile', authenticate, asyncHandler(controller.getProfile));
router.get('/dashboard', authenticate, asyncHandler(controller.getDashboard));

// 3. Sub-Module Mounts (Multi-Module Architecture)
router.use('/store', vendorStoreRoutes);
router.use('/products', vendorProductRoutes);
router.use('/kyc', vendorKycRoutes);
router.use('/orders', vendorOrderRoutes);

export const vendorRoutes = router;
