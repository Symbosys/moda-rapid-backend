import { Request, Response } from 'express';
import { CheckoutService } from './checkout.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService = new CheckoutService()) {}

  validate = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const result = await this.checkoutService.validateCheckout(userId, req.body);
    ApiResponse.success(res, result, 'Checkout validation successful', HttpStatus.OK);
  };
}
