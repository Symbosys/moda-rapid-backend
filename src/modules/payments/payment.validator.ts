import { z } from 'zod';

export const PaymentMethodSchema = z.enum(['UPI', 'CARD', 'NET_BANKING', 'COD']);

export const InitiatePaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentMethod: PaymentMethodSchema,
  amount: z.number().positive('Payment amount must be positive'),
  vpa: z.string().optional(),
  bankCode: z.string().optional(),
});

export const VerifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  gatewayOrderId: z.string().min(1, 'Gateway order ID is required'),
  gatewaySignature: z.string().optional(),
});

export type InitiatePaymentInput = z.infer<typeof InitiatePaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;
