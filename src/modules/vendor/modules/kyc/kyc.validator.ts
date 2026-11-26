import { z } from 'zod';

export const SubmitVendorKycSchema = z.object({
  storeId: z.string().min(1, 'Store ID is required'),
  gstinNumber: z.string().min(15, 'GSTIN must be 15 characters').max(15),
  gstCertificateUrl: z.string().url('GST Certificate document URL is required'),
  panNumber: z.string().min(10, 'PAN must be 10 characters').max(10),
  panDocumentUrl: z.string().url('PAN document URL is required'),
  tradeLicenseUrl: z.string().url().optional(),
  aadhaarNumber: z.string().min(12, 'Aadhaar must be 12 digits').max(12),
  aadhaarFrontUrl: z.string().url('Aadhaar front photo URL is required'),
  aadhaarBackUrl: z.string().url('Aadhaar back photo URL is required'),
  bankAccountNumber: z.string().min(9).max(18),
  bankIfscCode: z.string().min(11).max(11),
  bankBeneficiaryName: z.string().min(2).max(100),
  cancelledChequeUrl: z.string().url('Cancelled cheque/passbook copy URL is required'),
  storeFrontPhotoUrl: z.string().url('Physical storefront with signboard photo is required'),
  storeInsidePhotoUrl: z.string().url('Store interior stock photo is required'),
  brandAuthorizationUrl: z.string().url().optional(),
});

export const UpdateKycStatusSchema = z.object({
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

export type SubmitVendorKycInput = z.infer<typeof SubmitVendorKycSchema>;
export type UpdateKycStatusInput = z.infer<typeof UpdateKycStatusSchema>;
