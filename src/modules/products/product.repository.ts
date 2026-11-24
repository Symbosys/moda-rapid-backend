import { prisma } from '../../config/database';
import { Product, ProductVariant, Store } from '@prisma/client';

export type ProductWithDetails = Product & {
  store: Store;
  variants: ProductVariant[];
};

export class ProductRepository {
  async findMany(where: Record<string, unknown>, skip = 0, take = 20): Promise<ProductWithDetails[]> {
    return prisma.product.findMany({
      where: {
        isActive: true,
        ...where,
      },
      include: {
        store: true,
        variants: true,
      },
      skip,
      take,
    });
  }

  async findById(id: string): Promise<ProductWithDetails | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
        variants: true,
      },
    });
  }

  async findSimilar(categoryId: string, excludeId: string, limit = 6): Promise<ProductWithDetails[]> {
    return prisma.product.findMany({
      where: {
        categoryId,
        id: { not: excludeId },
        isActive: true,
      },
      include: {
        store: true,
        variants: true,
      },
      take: limit,
    });
  }
}
