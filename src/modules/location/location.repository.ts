import { prisma } from '../../config/database';
import { Store } from '@prisma/client';

export class LocationRepository {
  async findActiveStores(): Promise<Store[]> {
    return prisma.store.findMany({
      where: {
        isActive: true,
        isOpen: true,
      },
    });
  }
}
