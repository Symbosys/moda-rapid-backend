import { prisma } from '../../config/database';
import { Store } from '@prisma/client';

export class StoreRepository {
  async findAllActive(filter?: { isBrandStore?: boolean; brandName?: string }): Promise<Store[]> {
    return prisma.store.findMany({
      where: {
        isActive: true,
        ...(filter?.isBrandStore !== undefined ? { isBrandStore: filter.isBrandStore } : {}),
        ...(filter?.brandName ? { brandName: { equals: filter.brandName, mode: 'insensitive' } } : {}),
      },
      orderBy: { rating: 'desc' },
    });
  }

  async findBrandStores(): Promise<Store[]> {
    return prisma.store.findMany({
      where: { isActive: true, isBrandStore: true },
      orderBy: { rating: 'desc' },
    });
  }

  async findById(storeId: string): Promise<Store | null> {
    return prisma.store.findUnique({
      where: { id: storeId },
    });
  }
}
