import { Router } from 'express';
import { AddressController } from './address.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import { CreateAddressSchema, UpdateAddressSchema } from './address.validator';
import { asyncHandler } from '../../common/utils/async-handler';
import { authenticate } from '../../common/middlewares/auth.middleware';

const router = Router();
const controller = new AddressController();

router.use(authenticate);

router.get('/', asyncHandler(controller.getAddresses));
router.post('/', validateRequest({ body: CreateAddressSchema }), asyncHandler(controller.createAddress));
router.put('/:id', validateRequest({ body: UpdateAddressSchema }), asyncHandler(controller.updateAddress));
router.delete('/:id', asyncHandler(controller.deleteAddress));
router.post('/:id/set-default', asyncHandler(controller.setDefaultAddress));

export const addressRoutes = router;
