import { z } from 'zod';

export const CreateProductVariantSchema = z.object({
  size: z.string().min(1, 'Size is required (e.g., S, M, L, XL, 32, 34)').max(20),
  color: z.string().min(1, 'Color is required (e.g., Black, Navy Blue, Crimson)').max(50),
  stockQuantity: z.number().int().nonnegative('Stock must be 0 or positive').default(10),
  sku: z.string().max(100).optional(),
});

export const CreateVendorProductSchema = z.object({
  storeId: z.string().min(1, 'Store ID is required'),
  categoryId: z.string().min(1, 'Category/Type ID is required'),
  name: z.string().min(3, 'Product name must be at least 3 characters').max(200),
  brand: z.string().min(1, 'Brand name is required').max(100),
  description: z.string().max(5000).optional(),
  sellingPrice: z.number().positive('Selling price must be greater than 0'),
  originalPrice: z.number().positive('Original price must be greater than 0'),
  discountPercent: z.number().int().min(0).max(100).optional(),
  imageUrl: z.string().url('Primary product image must be a valid URL'),
  galleryUrls: z.array(z.string().url()).optional().default([]),
  isExpressDelivery: z.boolean().optional().default(true),
  deliveryEta: z.string().optional().default('25 mins'),
  variants: z.array(CreateProductVariantSchema).min(1, 'At least one variant (Size & Color) is required'),
});

export const UpdateVendorProductSchema = CreateVendorProductSchema.partial();

export const UpdateVariantStockSchema = z.object({
  stockQuantity: z.number().int().nonnegative('Stock quantity must be 0 or positive'),
});

export const VendorProductQuerySchema = z.object({
  storeId: z.string().optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  inStockOnly: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('20').transform(Number),
});

export type CreateVendorProductInput = z.infer<typeof CreateVendorProductSchema>;
export type UpdateVendorProductInput = z.infer<typeof UpdateVendorProductSchema>;
export type CreateProductVariantInput = z.infer<typeof CreateProductVariantSchema>;
export type UpdateVariantStockInput = z.infer<typeof UpdateVariantStockSchema>;
export type VendorProductQueryInput = z.infer<typeof VendorProductQuerySchema>;
