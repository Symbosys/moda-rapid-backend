import { z } from 'zod';

export const RequestOtpSchema = z.object({
  mobileNumber: z
    .string()
    .min(7, 'Mobile number must be at least 7 digits')
    .max(16, 'Mobile number cannot exceed 16 digits')
    .regex(/^\+?[0-9\s-]+$/, 'Invalid mobile number format'),
});

export const VerifyOtpSchema = z.object({
  mobileNumber: z
    .string()
    .min(7, 'Mobile number must be at least 7 digits')
    .max(16, 'Mobile number cannot exceed 16 digits'),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]+$/, 'OTP must be numeric'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RequestOtpInput = z.infer<typeof RequestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
