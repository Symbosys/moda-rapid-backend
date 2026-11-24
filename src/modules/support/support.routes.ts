import { Router } from 'express';
import { SupportController } from './support.controller';
import { asyncHandler } from '../../common/utils/async-handler';

const router = Router();
const controller = new SupportController();

router.get('/faqs', asyncHandler(controller.getFaqs));

export const supportRoutes = router;
