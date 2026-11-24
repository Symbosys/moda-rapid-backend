import { prisma } from '../../config/database';
import { Coupon } from '@prisma/client';

export class CouponRepository {
  async findAllActive(): Promise<Coupon[]> {
    return prisma.coupon.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { minOrderAmount: 'asc' },
    });
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return prisma.coupon.findFirst({
      where: {
        code: { equals: code, mode: 'insensitive' },
        isActive: true,
      },
    });
  }
}
