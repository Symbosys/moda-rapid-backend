import { Router } from 'express';
import { VendorKycController } from './kyc.controller';
import { validateRequest } from '../../../../common/middlewares/validate.middleware';
import { SubmitVendorKycSchema, UpdateKycStatusSchema } from './kyc.validator';
import { asyncHandler } from '../../../../common/utils/async-handler';
import { authenticate } from '../../../../common/middlewares/auth.middleware';

const router = Router();
const controller = new VendorKycController();

router.use(authenticate);

router.post('/submit', validateRequest({ body: SubmitVendorKycSchema }), asyncHandler(controller.submitKyc));
router.get('/status', asyncHandler(controller.getKycStatus));
router.patch('/status/:storeId', validateRequest({ body: UpdateKycStatusSchema }), asyncHandler(controller.updateKycStatus));

export const vendorKycRoutes = router;
