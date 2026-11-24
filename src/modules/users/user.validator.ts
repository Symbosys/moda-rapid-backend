import { z } from 'zod';

export const UpdateUserProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email address format').optional().or(z.literal('')),
  avatarUrl: z.string().url('Invalid avatar URL format').optional().or(z.literal('')),
});

export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
