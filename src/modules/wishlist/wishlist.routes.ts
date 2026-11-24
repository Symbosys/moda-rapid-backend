import { Router } from 'express';
import { WishlistController } from './wishlist.controller';
import { validateRequest } from '../../common/middlewares/validate.middleware';
import { AddToWishlistSchema } from './wishlist.validator';
import { asyncHandler } from '../../common/utils/async-handler';
import { authenticate } from '../../common/middlewares/auth.middleware';

const router = Router();
const controller = new WishlistController();

router.use(authenticate);

router.get('/', asyncHandler(controller.getWishlist));
router.post('/add', validateRequest({ body: AddToWishlistSchema }), asyncHandler(controller.addToWishlist));
router.delete('/remove/:id', asyncHandler(controller.removeFromWishlist));

export const wishlistRoutes = router;
