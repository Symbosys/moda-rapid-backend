import { Request, Response } from 'express';
import { VendorService } from './vendor.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class VendorController {
  constructor(private readonly vendorService: VendorService = new VendorService()) {}

  requestOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.vendorService.requestOtp(req.body);
    ApiResponse.success(res, result, 'OTP sent successfully to vendor mobile number', HttpStatus.OK);
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.vendorService.verifyOtp(req.body);
    ApiResponse.success(res, result, 'Vendor logged in successfully with OTP', HttpStatus.OK);
  };

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.vendorService.register(req.body);
    ApiResponse.success(res, result, 'Vendor account and store registered successfully', HttpStatus.CREATED);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.vendorService.login(req.body);
    ApiResponse.success(res, result, 'Vendor logged in successfully', HttpStatus.OK);
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.user?.userId || 'usr_vendor_default';
    const profile = await this.vendorService.getProfile(vendorId);
    ApiResponse.success(res, profile, 'Vendor profile retrieved successfully', HttpStatus.OK);
  };

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.user?.userId || 'usr_vendor_default';
    const storeId = req.query.storeId as string | undefined;
    const dashboard = await this.vendorService.getDashboard(vendorId, storeId);
    ApiResponse.success(res, dashboard, 'Vendor dashboard statistics retrieved successfully', HttpStatus.OK);
  };
}
