import { prisma } from '../../config/database';
import { Wishlist, Product, ProductVariant, Store } from '@prisma/client';

type WishlistWithProduct = Wishlist & {
  product: Product & {
    store: Store;
    variants: ProductVariant[];
  };
};

export class WishlistRepository {
  async findByUserId(userId: string): Promise<WishlistWithProduct[]> {
    return prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            store: true,
            variants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, productId: string): Promise<Wishlist> {
    return prisma.wishlist.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      create: { userId, productId },
      update: {},
    });
  }

  async remove(userId: string, productId: string): Promise<void> {
    await prisma.wishlist.deleteMany({
      where: { userId, productId },
    });
  }

  async isWishlisted(userId: string, productId: string): Promise<boolean> {
    const item = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
    return !!item;
  }
}
