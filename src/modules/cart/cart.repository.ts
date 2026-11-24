import { prisma } from '../../config/database';
import { Cart, CartItem, Product, ProductVariant, Store } from '@prisma/client';

export type CartWithItems = Cart & {
  store: Store | null;
  items: (CartItem & {
    product: Product & { store: Store };
    variant: ProductVariant;
  })[];
};

export class CartRepository {
  async findByUserId(userId: string): Promise<CartWithItems | null> {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        store: true,
        items: {
          include: {
            product: { include: { store: true } },
            variant: true,
          },
        },
      },
    });
  }

  async getOrCreateCart(userId: string): Promise<Cart> {
    return prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async clearCartItems(cartId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { cartId },
    });
    await prisma.cart.update({
      where: { id: cartId },
      data: {
        storeId: null,
        appliedCoupon: null,
        couponDiscount: 0,
      },
    });
  }

  async setStore(cartId: string, storeId: string): Promise<void> {
    await prisma.cart.update({
      where: { id: cartId },
      data: { storeId },
    });
  }

  async upsertCartItem(
    cartId: string,
    productId: string,
    variantId: string,
    quantity: number,
    unitPrice: number
  ): Promise<CartItem> {
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: { cartId, variantId },
      },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId,
        productId,
        variantId,
        quantity,
        unitPrice,
      },
    });
  }

  async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }
  }

  async removeItem(cartId: string, itemId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId },
    });
  }

  async setCoupon(cartId: string, couponCode: string | null, discount: number): Promise<void> {
    await prisma.cart.update({
      where: { id: cartId },
      data: {
        appliedCoupon: couponCode,
        couponDiscount: discount,
      },
    });
  }
}
