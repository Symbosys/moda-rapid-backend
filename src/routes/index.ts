import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { userRoutes } from '../modules/users/user.routes';
import { addressRoutes } from '../modules/addresses/address.routes';
import { locationRoutes } from '../modules/location/location.routes';
import { storeRoutes } from '../modules/stores/store.routes';
import { categoryRoutes } from '../modules/categories/category.routes';
import { productRoutes } from '../modules/products/product.routes';
import { homeRoutes } from '../modules/home/home.routes';
import { wishlistRoutes } from '../modules/wishlist/wishlist.routes';
import { cartRoutes } from '../modules/cart/cart.routes';
import { couponRoutes } from '../modules/coupons/coupon.routes';
import { checkoutRoutes } from '../modules/checkout/checkout.routes';
import { paymentRoutes } from '../modules/payments/payment.routes';
import { orderRoutes } from '../modules/orders/order.routes';
import { trackingRoutes } from '../modules/tracking/tracking.routes';
import { notificationRoutes } from '../modules/notifications/notification.routes';
import { supportRoutes } from '../modules/support/support.routes';
import { vendorRoutes } from '../modules/vendor/vendor.routes';

const router = Router();

// Phase 1 Modules
router.use('/health', healthRoutes);

// Phase 2 Modules
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/user/addresses', addressRoutes);
router.use('/addresses', addressRoutes);
router.use('/location', locationRoutes);

// Phase 3 Modules
router.use('/stores', storeRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/home', homeRoutes);
router.use('/wishlist', wishlistRoutes);

// Phase 4 Modules
router.use('/cart', cartRoutes);
router.use('/coupons', couponRoutes);

// Phase 5 Modules
router.use('/checkout', checkoutRoutes);
router.use('/payments', paymentRoutes);

// Phase 6 Modules
router.use('/orders', orderRoutes);
router.use('/tracking', trackingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/support', supportRoutes);

// Vendor & Merchant Module (Multi-Module Subsystem)
router.use('/vendor', vendorRoutes);

export const apiRouter = router;
