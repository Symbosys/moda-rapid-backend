import { z } from 'zod';

export const CreateAddressSchema = z.object({
  tag: z.enum(['HOME', 'WORK', 'OTHER', 'Home', 'Work', 'Other']).default('HOME').transform((val) => val.toUpperCase() as 'HOME' | 'WORK' | 'OTHER'),
  houseNo: z.string().min(1, 'House/Flat number is required').max(100),
  area: z.string().min(2, 'Area/Street details are required').max(255),
  landmark: z.string().max(255).optional().default(''),
  city: z.string().min(2, 'City is required').max(100),
  pincode: z.string().min(4, 'Pincode must be at least 4 digits').max(10),
  contactPhone: z.string().min(7, 'Contact phone is required').max(15),
  latitude: z.number().optional().default(28.5584),
  longitude: z.number().optional().default(77.2023),
  isDefault: z.boolean().optional().default(false),
});

export const UpdateAddressSchema = CreateAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;
