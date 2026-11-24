import { CartRepository, CartWithItems } from './cart.repository';
import { ProductService, ProductClientModel } from '../products/product.service';
import { CouponService } from '../coupons/coupon.service';
import { AddCartItemInput, UpdateCartItemQuantityInput } from './cart.validator';
import { ShopConflictError, NotFoundError } from '../../common/errors/app-error';

export interface CartItemClientModel {
  id: string;
  product: ProductClientModel;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  shopId: string;
  shopName: string;
  unitPrice: number;
  totalPrice: number;
}

export interface CartStateResponse {
  items: CartItemClientModel[];
  activeShopId: string | null;
  activeShopName: string | null;
  totalItemCount: number;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  discount: number;
  appliedCoupon: string | null;
  totalAmount: number;
}

export class CartService {
  // In-memory session cart store for fallback if DB is offline
  private static localSessionCarts: Map<string, CartStateResponse> = new Map();

  constructor(
    private readonly cartRepo: CartRepository = new CartRepository(),
    private readonly productService: ProductService = new ProductService(),
    private readonly couponService: CouponService = new CouponService()
  ) {}

  private computePriceBreakdown(
    items: CartItemClientModel[],
    appliedCoupon: string | null,
    discountAmount: number
  ): CartStateResponse {
    const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

    let deliveryFee = 0;
    if (items.length > 0) {
      if (appliedCoupon === 'FREESHIP' || subtotal >= 999) {
        deliveryFee = 0;
      } else {
        deliveryFee = 40.0;
      }
    }

    const platformFee = items.length > 0 ? 15.0 : 0.0;
    const tax = items.length > 0 ? Math.round(subtotal * 0.05) : 0.0;

    let finalDiscount = discountAmount;
    if (appliedCoupon && items.length > 0) {
      try {
        const validated = this.couponService.calculateDiscount(appliedCoupon, subtotal);
        finalDiscount = validated.discountAmount;
      } catch {
        finalDiscount = 0;
      }
    } else {
      finalDiscount = 0;
    }

    const totalAmount = Math.max(0, subtotal - finalDiscount + deliveryFee + platformFee + tax);

    return {
      items,
      activeShopId: items.length > 0 ? items[0].shopId : null,
      activeShopName: items.length > 0 ? items[0].shopName : null,
      totalItemCount,
      subtotal,
      deliveryFee,
      platformFee,
      tax,
      discount: finalDiscount,
      appliedCoupon: items.length > 0 ? appliedCoupon : null,
      totalAmount,
    };
  }

  async getCart(userId: string): Promise<CartStateResponse> {
    try {
      const dbCart = await this.cartRepo.findByUserId(userId);

      if (!dbCart || dbCart.items.length === 0) {
        const memoryCart = CartService.localSessionCarts.get(userId);
        if (memoryCart) return memoryCart;

        return this.computePriceBreakdown([], null, 0);
      }

      const clientItems: CartItemClientModel[] = dbCart.items.map((i) => ({
        id: i.id,
        product: {
          id: i.product.id,
          name: i.product.name,
          brand: i.product.brand,
          sellingPrice: Number(i.unitPrice),
          originalPrice: Number(i.product.originalPrice),
          imageUrl: i.product.imageUrl,
          shopId: i.product.storeId,
          shopName: i.product.store.name,
          availableSizes: [i.variant.size],
          availableColors: [i.variant.color],
          isExpressDelivery: i.product.isExpressDelivery,
          isWishlisted: false,
          isInStock: true,
        },
        selectedSize: i.variant.size,
        selectedColor: i.variant.color,
        quantity: i.quantity,
        shopId: i.product.storeId,
        shopName: i.product.store.name,
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.unitPrice) * i.quantity,
      }));

      return this.computePriceBreakdown(
        clientItems,
        dbCart.appliedCoupon,
        Number(dbCart.couponDiscount)
      );
    } catch {
      const memoryCart = CartService.localSessionCarts.get(userId);
      return memoryCart || this.computePriceBreakdown([], null, 0);
    }
  }

  async addItem(userId: string, input: AddCartItemInput): Promise<CartStateResponse> {
    const product = await this.productService.getProductById(input.productId);
    const currentCart = await this.getCart(userId);

    // PRD Section 6.11: Single-Store Per Order Invariant
    if (
      currentCart.activeShopId &&
      currentCart.activeShopId !== product.shopId &&
      currentCart.items.length > 0
    ) {
      if (!input.replaceIfConflict) {
        throw new ShopConflictError(
          `Your cart contains items from '${currentCart.activeShopName}'. Discard cart and start order from '${product.shopName}'?`,
          {
            currentShopId: currentCart.activeShopId,
            currentShopName: currentCart.activeShopName,
            attemptedShopId: product.shopId,
            attemptedShopName: product.shopName,
          }
        );
      }
      // User opted to replace cart
      await this.clearCart(userId);
    }

    const itemId = `${product.id}_${input.size}_${input.color}`;
    const existingIndex = currentCart.items.findIndex(
      (i) => i.product.id === product.id && i.selectedSize === input.size && i.selectedColor === input.color
    );

    let updatedItems: CartItemClientModel[];

    if (existingIndex >= 0) {
      const existing = currentCart.items[existingIndex];
      const updatedItem = {
        ...existing,
        quantity: existing.quantity + input.quantity,
        totalPrice: existing.unitPrice * (existing.quantity + input.quantity),
      };
      updatedItems = [...currentCart.items];
      updatedItems[existingIndex] = updatedItem;
    } else {
      const newItem: CartItemClientModel = {
        id: itemId,
        product,
        selectedSize: input.size,
        selectedColor: input.color,
        quantity: input.quantity,
        shopId: product.shopId,
        shopName: product.shopName,
        unitPrice: product.sellingPrice,
        totalPrice: product.sellingPrice * input.quantity,
      };
      updatedItems = [...currentCart.items, newItem];
    }

    const state = this.computePriceBreakdown(
      updatedItems,
      currentCart.appliedCoupon,
      currentCart.discount
    );

    CartService.localSessionCarts.set(userId, state);
    return state;
  }

  async updateItemQuantity(
    userId: string,
    input: UpdateCartItemQuantityInput
  ): Promise<CartStateResponse> {
    const currentCart = await this.getCart(userId);

    let updatedItems: CartItemClientModel[];

    if (input.quantity <= 0) {
      updatedItems = currentCart.items.filter((i) => i.id !== input.itemId);
    } else {
      updatedItems = currentCart.items.map((i) => {
        if (i.id === input.itemId) {
          return {
            ...i,
            quantity: input.quantity,
            totalPrice: i.unitPrice * input.quantity,
          };
        }
        return i;
      });
    }

    const state = this.computePriceBreakdown(
      updatedItems,
      currentCart.appliedCoupon,
      currentCart.discount
    );

    CartService.localSessionCarts.set(userId, state);
    return state;
  }

  async removeItem(userId: string, itemId: string): Promise<CartStateResponse> {
    return this.updateItemQuantity(userId, { itemId, quantity: 0 });
  }

  async clearCart(userId: string): Promise<CartStateResponse> {
    try {
      const dbCart = await this.cartRepo.findByUserId(userId);
      if (dbCart) {
        await this.cartRepo.clearCartItems(dbCart.id);
      }
    } catch {
      // offline pass
    }

    const state = this.computePriceBreakdown([], null, 0);
    CartService.localSessionCarts.set(userId, state);
    return state;
  }

  async applyCoupon(userId: string, code: string): Promise<CartStateResponse> {
    const currentCart = await this.getCart(userId);

    if (currentCart.items.length === 0) {
      throw new NotFoundError('Cannot apply coupon to an empty cart');
    }

    const { discountAmount } = this.couponService.calculateDiscount(code, currentCart.subtotal);

    const state = this.computePriceBreakdown(currentCart.items, code.toUpperCase(), discountAmount);
    CartService.localSessionCarts.set(userId, state);
    return state;
  }

  async removeCoupon(userId: string): Promise<CartStateResponse> {
    const currentCart = await this.getCart(userId);
    const state = this.computePriceBreakdown(currentCart.items, null, 0);
    CartService.localSessionCarts.set(userId, state);
    return state;
  }
}
