import { prisma } from '../../config/database';
import { Order, OrderItem, Address, Store, OrderAssignment, DeliveryPartner, OrderStatusEnum } from '@prisma/client';

export type OrderWithRelations = Order & {
  store: Store;
  deliveryAddress: Address;
  items: OrderItem[];
  assignment: (OrderAssignment & { partner: DeliveryPartner }) | null;
};

export class OrderRepository {
  async createOrder(data: {
    id: string;
    userId: string;
    storeId: string;
    addressId: string;
    subtotal: number;
    deliveryFee: number;
    platformFee: number;
    tax: number;
    discount: number;
    totalAmount: number;
    paymentMethod: any;
    isPaid: boolean;
    orderStatus: OrderStatusEnum;
    estimatedDeliveryMinutes: number;
    items: {
      productId: string;
      variantId: string;
      productName: string;
      brand: string;
      size: string;
      color: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      imageUrl: string;
    }[];
  }): Promise<OrderWithRelations> {
    return prisma.order.create({
      data: {
        id: data.id,
        userId: data.userId,
        storeId: data.storeId,
        addressId: data.addressId,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        platformFee: data.platformFee,
        tax: data.tax,
        discount: data.discount,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        isPaid: data.isPaid,
        orderStatus: data.orderStatus,
        estimatedDeliveryMinutes: data.estimatedDeliveryMinutes,
        items: {
          create: data.items,
        },
      },
      include: {
        store: true,
        deliveryAddress: true,
        items: true,
        assignment: {
          include: { partner: true },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<OrderWithRelations[]> {
    return prisma.order.findMany({
      where: { userId },
      include: {
        store: true,
        deliveryAddress: true,
        items: true,
        assignment: {
          include: { partner: true },
        },
      },
      orderBy: { placedAt: 'desc' },
    });
  }

  async findById(orderId: string): Promise<OrderWithRelations | null> {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: true,
        deliveryAddress: true,
        items: true,
        assignment: {
          include: { partner: true },
        },
      },
    });
  }

  async updateStatus(
    orderId: string,
    status: OrderStatusEnum,
    cancellationReason?: string,
    returnStatus?: string
  ): Promise<OrderWithRelations> {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: status,
        ...(cancellationReason ? { cancellationReason } : {}),
        ...(returnStatus ? { returnStatus } : {}),
      },
      include: {
        store: true,
        deliveryAddress: true,
        items: true,
        assignment: {
          include: { partner: true },
        },
      },
    });
  }
}
