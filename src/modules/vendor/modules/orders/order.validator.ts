import { z } from 'zod';

export const UpdateVendorOrderStatusSchema = z.object({
  status: z.enum([
    'ORDER_PLACED',
    'ORDER_ACCEPTED',
    'PREPARING_ORDER',
    'READY_FOR_PICKUP',
    'PARTNER_ASSIGNED',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
  notes: z.string().optional(),
});

export const VendorOrderQuerySchema = z.object({
  storeId: z.string().optional(),
  status: z.string().optional(),
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('20').transform(Number),
});

export type UpdateVendorOrderStatusInput = z.infer<typeof UpdateVendorOrderStatusSchema>;
export type VendorOrderQueryInput = z.infer<typeof VendorOrderQuerySchema>;
