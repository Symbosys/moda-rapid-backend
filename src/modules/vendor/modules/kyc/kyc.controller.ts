import { Request, Response } from 'express';
import { VendorKycService } from './kyc.service';
import { ApiResponse } from '../../../../common/utils/response-formatter';
import { HttpStatus } from '../../../../common/constants/api-status';

export class VendorKycController {
  constructor(private readonly kycService: VendorKycService = new VendorKycService()) {}

  submitKyc = async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.user?.userId || 'usr_vendor_default';
    const result = await this.kycService.submitKyc(vendorId, req.body);
    ApiResponse.success(res, result, 'KYC documents submitted and verified successfully', HttpStatus.OK);
  };

  getKycStatus = async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.user?.userId || 'usr_vendor_default';
    const storeId = req.query.storeId as string | undefined;
    const result = await this.kycService.getKycStatus(vendorId, storeId);
    ApiResponse.success(res, result, 'KYC status retrieved successfully', HttpStatus.OK);
  };

  updateKycStatus = async (req: Request, res: Response): Promise<void> => {
    const storeId = req.params.storeId;
    const result = await this.kycService.updateKycStatus(storeId, req.body);
    ApiResponse.success(res, result, 'KYC status updated successfully', HttpStatus.OK);
  };
}
