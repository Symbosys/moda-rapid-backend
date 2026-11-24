import { Router } from 'express';
import { CategoryController } from './category.controller';
import { asyncHandler } from '../../common/utils/async-handler';

const router = Router();
const controller = new CategoryController();

router.get('/', asyncHandler(controller.getAllCategories));
router.get('/quick', asyncHandler(controller.getQuickCategories));

export const categoryRoutes = router;
