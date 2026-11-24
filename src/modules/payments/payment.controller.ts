import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService = new PaymentService()) {}

  getNetBankingBanks = async (req: Request, res: Response): Promise<void> => {
    const banks = this.paymentService.getNetBankingBanks();
    ApiResponse.success(res, banks, 'Supported banks fetched successfully', HttpStatus.OK);
  };

  initiatePayment = async (req: Request, res: Response): Promise<void> => {
    const result = await this.paymentService.initiatePayment(req.body);
    ApiResponse.success(res, result, 'Payment initiated successfully', HttpStatus.OK);
  };

  verifyPayment = async (req: Request, res: Response): Promise<void> => {
    const result = await this.paymentService.verifyPayment(req.body);
    ApiResponse.success(res, result, 'Payment verified successfully', HttpStatus.OK);
  };

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = (req.headers['x-razorpay-signature'] ||
      req.headers['x-webhook-signature']) as string;

    const event = (req.body?.event as string) || 'payment.captured';
    const result = await this.paymentService.handleWebhook(event, req.body);

    ApiResponse.success(res, result, 'Webhook processed successfully', HttpStatus.OK);
  };
}
