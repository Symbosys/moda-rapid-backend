import { z } from 'zod';

export const ApplyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').trim(),
});

export type ApplyCouponInput = z.infer<typeof ApplyCouponSchema>;
