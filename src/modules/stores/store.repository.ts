import { prisma } from '../../config/database';
import { Store } from '@prisma/client';

export class StoreRepository {
  async findAllActive(): Promise<Store[]> {
    return prisma.store.findMany({
      where: { isActive: true },
      orderBy: { rating: 'desc' },
    });
  }

  async findById(storeId: string): Promise<Store | null> {
    return prisma.store.findUnique({
      where: { id: storeId },
    });
  }
}
