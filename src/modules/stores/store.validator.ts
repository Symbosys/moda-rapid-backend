import { z } from 'zod';

export const NearbyStoresQuerySchema = z.object({
  lat: z.string().optional().transform((val) => (val ? parseFloat(val) : 28.5584)),
  lng: z.string().optional().transform((val) => (val ? parseFloat(val) : 77.2023)),
  radius: z.string().optional().transform((val) => (val ? parseFloat(val) : 8.0)),
});

export type NearbyStoresQueryInput = z.infer<typeof NearbyStoresQuerySchema>;
