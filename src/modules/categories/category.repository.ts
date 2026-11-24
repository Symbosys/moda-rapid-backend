import { prisma } from '../../config/database';
import { Category } from '@prisma/client';

export class CategoryRepository {
  async findAll(): Promise<(Category & { children: Category[] })[]> {
    return prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: { children: true },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
