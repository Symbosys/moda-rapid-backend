import { prisma } from '../../../../config/database';
import { OrderStatusEnum } from '@prisma/client';

export class VendorOrderRepository {
  async findByStoreId(storeId: string, status?: string) {
    return prisma.order.findMany({
      where: {
        storeId,
        ...(status ? { orderStatus: status as OrderStatusEnum } : {}),
      },
      include: {
        items: true,
        deliveryAddress: true,
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { placedAt: 'desc' },
    });
  }

  async findById(orderId: string, storeId?: string) {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        ...(storeId ? { storeId } : {}),
      },
      include: {
        items: true,
        deliveryAddress: true,
        user: true,
      },
    });
  }

  async updateStatus(orderId: string, status: OrderStatusEnum) {
    return prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
      include: { items: true },
    });
  }
}
