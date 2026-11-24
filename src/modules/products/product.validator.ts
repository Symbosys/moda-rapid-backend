import { z } from 'zod';

export const ProductQuerySchema = z.object({
  trending: z.string().optional().transform((val) => val === 'true'),
  categoryId: z.string().optional(),
  storeId: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  sort: z.string().optional().default('relevance'),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
});

export const ProductSearchQuerySchema = z.object({
  q: z.string().optional().default(''),
  brands: z.string().optional(),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  sort: z.string().optional().default('relevance'),
});

export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
export type ProductSearchQueryInput = z.infer<typeof ProductSearchQuerySchema>;
