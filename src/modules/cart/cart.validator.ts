import { z } from 'zod';

export const AddCartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  size: z.string().min(1, 'Selected size is required'),
  color: z.string().min(1, 'Selected color is required'),
  quantity: z.number().int().min(1).default(1),
  replaceIfConflict: z.boolean().optional().default(false),
});

export const UpdateCartItemQuantitySchema = z.object({
  itemId: z.string().min(1, 'Cart item ID is required'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
});

export type AddCartItemInput = z.infer<typeof AddCartItemSchema>;
export type UpdateCartItemQuantityInput = z.infer<typeof UpdateCartItemQuantitySchema>;
