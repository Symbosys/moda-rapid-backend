import { Request, Response } from 'express';
import { CouponService } from './coupon.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class CouponController {
  constructor(private readonly couponService: CouponService = new CouponService()) {}

  getAvailableCoupons = async (req: Request, res: Response): Promise<void> => {
    const coupons = await this.couponService.getAvailableCoupons();
    ApiResponse.success(res, coupons, 'Available coupons fetched successfully', HttpStatus.OK);
  };

  applyCoupon = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.body;
    // Calculation handled in CartService; this provides standalone validation
    const result = this.couponService.calculateDiscount(code, 1000);
    ApiResponse.success(res, result, `Coupon ${code} is valid`, HttpStatus.OK);
  };
}
