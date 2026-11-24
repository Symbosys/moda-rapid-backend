import { z } from 'zod';

export const ServiceabilityCheckSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const ReverseGeocodeSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type ServiceabilityCheckInput = z.infer<typeof ServiceabilityCheckSchema>;
export type ReverseGeocodeInput = z.infer<typeof ReverseGeocodeSchema>;
