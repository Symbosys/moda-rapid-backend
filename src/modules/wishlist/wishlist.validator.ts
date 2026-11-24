import { z } from 'zod';

export const AddToWishlistSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export type AddToWishlistInput = z.infer<typeof AddToWishlistSchema>;
