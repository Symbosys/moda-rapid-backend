import { prisma } from '../../config/database';
import { Payment, PaymentMethodType, PaymentStatus } from '@prisma/client';

export class PaymentRepository {
  async createPaymentRecord(data: {
    orderId: string;
    paymentMethod: PaymentMethodType;
    amount: number;
    gatewayProvider?: string;
    gatewayOrderId?: string;
    status?: PaymentStatus;
    upiVpa?: string;
    bankName?: string;
    cardNetwork?: string;
    cardLast4?: string;
    codCollectionStatus?: string;
  }): Promise<Payment> {
    return prisma.payment.create({
      data: {
        orderId: data.orderId,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        gatewayProvider: data.gatewayProvider || 'RAZORPAY',
        gatewayOrderId: data.gatewayOrderId,
        status: data.status || 'PENDING',
        upiVpa: data.upiVpa,
        bankName: data.bankName,
        cardNetwork: data.cardNetwork,
        cardLast4: data.cardLast4,
        codCollectionStatus: data.codCollectionStatus || 'PENDING',
      },
    });
  }

  async findByGatewayOrderId(gatewayOrderId: string): Promise<Payment | null> {
    return prisma.payment.findFirst({
      where: { gatewayOrderId },
    });
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    gatewayPaymentId?: string,
    rawResponse?: Record<string, unknown>
  ): Promise<Payment> {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        ...(gatewayPaymentId ? { gatewayPaymentId } : {}),
        ...(rawResponse ? { rawGatewayResponse: rawResponse as any } : {}),
      },
    });
  }
}
