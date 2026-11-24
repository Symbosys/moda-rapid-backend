import { z } from 'zod';
import { PaymentMethodSchema } from '../payments/payment.validator';

export const CreateOrderSchema = z.object({
  addressId: z.string().min(1, 'Delivery address ID is required'),
  paymentMethod: PaymentMethodSchema,
  couponCode: z.string().optional(),
});

export const CancelOrderSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason must be at least 3 characters'),
});

export const ReturnOrderSchema = z.object({
  orderId: z.string().optional(),
  reason: z.string().min(5, 'Return reason must be at least 5 characters'),
  pickupDate: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type CancelOrderInput = z.infer<typeof CancelOrderSchema>;
export type ReturnOrderInput = z.infer<typeof ReturnOrderSchema>;
