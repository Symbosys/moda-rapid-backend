import { Router } from 'express';
import { VendorProductController } from './product.controller';
import { validateRequest } from '../../../../common/middlewares/validate.middleware';
import {
  CreateVendorProductSchema,
  UpdateVendorProductSchema,
  CreateProductVariantSchema,
  UpdateVariantStockSchema,
  VendorProductQuerySchema,
} from './product.validator';
import { asyncHandler } from '../../../../common/utils/async-handler';
import { authenticate } from '../../../../common/middlewares/auth.middleware';

const router = Router();
const controller = new VendorProductController();

router.use(authenticate);

router.get('/', validateRequest({ query: VendorProductQuerySchema }), asyncHandler(controller.getProducts));
router.get('/:id', asyncHandler(controller.getProductById));
router.post('/', validateRequest({ body: CreateVendorProductSchema }), asyncHandler(controller.createProduct));
router.put('/:id', validateRequest({ body: UpdateVendorProductSchema }), asyncHandler(controller.updateProduct));
router.post('/:id/variants', validateRequest({ body: CreateProductVariantSchema }), asyncHandler(controller.addVariant));
router.patch(
  '/:id/variants/:variantId/stock',
  validateRequest({ body: UpdateVariantStockSchema }),
  asyncHandler(controller.updateVariantStock)
);
router.delete('/:id', asyncHandler(controller.deleteProduct));

export const vendorProductRoutes = router;
