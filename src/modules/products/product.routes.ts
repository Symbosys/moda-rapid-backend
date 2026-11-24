import { Router } from 'express';
import { ProductController } from './product.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import { ProductQuerySchema, ProductSearchQuerySchema } from './product.validator';
import { asyncHandler } from '../../common/utils/async-handler';

const router = Router();
const controller = new ProductController();

router.get(
  '/',
  validateRequest({ query: ProductQuerySchema }),
  asyncHandler(controller.getProducts)
);

router.get(
  '/search',
  validateRequest({ query: ProductSearchQuerySchema }),
  asyncHandler(controller.searchProducts)
);

router.get('/suggestions', asyncHandler(controller.getSuggestions));

router.get('/:id', asyncHandler(controller.getProductDetails));

router.get('/:id/similar', asyncHandler(controller.getSimilarProducts));

export const productRoutes = router;
