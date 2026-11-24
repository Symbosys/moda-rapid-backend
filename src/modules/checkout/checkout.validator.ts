import { z } from 'zod';

export const CheckoutValidateSchema = z.object({
  addressId: z.string().min(1, 'Delivery address ID is required'),
  couponCode: z.string().optional(),
});

export type CheckoutValidateInput = z.infer<typeof CheckoutValidateSchema>;
