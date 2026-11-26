import { z } from 'zod';

export const CreateVendorStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters').max(150),
  slug: z.string().min(2).max(150).optional(),
  phone: z.string().min(10, 'Valid phone number is required').max(15),
  email: z.string().email('Invalid email address').optional(),
  bannerUrl: z.string().url('Banner URL must be a valid URL'),
  logoUrl: z.string().url('Logo URL must be a valid URL').optional(),
  addressText: z.string().min(5, 'Full street address is required').max(500),
  city: z.string().min(2, 'City is required').max(100),
  pincode: z.string().min(4, 'Valid pincode required').max(10),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  estimatedDeliveryTime: z.string().optional().default('20-30 min'),
  serviceRadiusKm: z.number().positive().optional().default(7.0),
  isBrandStore: z.boolean().optional().default(false),
  brandName: z.string().max(100).optional(),
});

export const UpdateVendorStoreSchema = CreateVendorStoreSchema.partial();

export const ToggleStoreStatusSchema = z.object({
  isOpen: z.boolean(),
});

export type CreateVendorStoreInput = z.infer<typeof CreateVendorStoreSchema>;
export type UpdateVendorStoreInput = z.infer<typeof UpdateVendorStoreSchema>;
export type ToggleStoreStatusInput = z.infer<typeof ToggleStoreStatusSchema>;
