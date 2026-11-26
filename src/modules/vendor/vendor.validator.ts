import { z } from 'zod';

export const RequestVendorOtpSchema = z.object({
  phone: z.string().min(10, 'Valid mobile number is required (min 10 digits)').max(15),
});

export const VerifyVendorOtpSchema = z.object({
  phone: z.string().min(10, 'Valid mobile number is required').max(15),
  otp: z.string().min(4, 'OTP must be 4 to 6 digits').max(6),
  fullName: z.string().max(100).optional(),
  businessName: z.string().max(150).optional(),
  businessType: z.enum(['PROPRIETORSHIP', 'PARTNERSHIP', 'PVT_LTD', 'LLP', 'INDIVIDUAL']).optional().default('PROPRIETORSHIP'),
});

export const RegisterVendorSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  phone: z.string().min(10, 'Valid 10-digit mobile number is required').max(15),
  email: z.string().email('Valid email is required').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  businessName: z.string().min(2, 'Business or Shop name is required').max(150),
  businessType: z.enum(['PROPRIETORSHIP', 'PARTNERSHIP', 'PVT_LTD', 'LLP', 'INDIVIDUAL']).default('PROPRIETORSHIP'),
});

export const LoginVendorSchema = z.object({
  phoneOrEmail: z.string().min(3, 'Phone or email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  otp: z.string().min(4).max(6).optional(),
});

export type RequestVendorOtpInput = z.infer<typeof RequestVendorOtpSchema>;
export type VerifyVendorOtpInput = z.infer<typeof VerifyVendorOtpSchema>;
export type RegisterVendorInput = z.infer<typeof RegisterVendorSchema>;
export type LoginVendorInput = z.infer<typeof LoginVendorSchema>;
