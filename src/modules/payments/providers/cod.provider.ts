import { BadRequestError } from '../../../common/errors/app-error';

export interface CodInitiateOptions {
  orderId: string;
  amount: number;
  userRiskScore?: number;
}

export interface CodPaymentIntent {
  method: 'COD';
  orderId: string;
  amount: number;
  currency: string;
  status: 'PENDING';
  collectionStatus: 'PENDING_DELIVERY';
  instructions: string;
}

export class CodPaymentProvider {
  validateAndInitiate(options: CodInitiateOptions): CodPaymentIntent {
    // PRD Section 5.4: COD max limit ₹5,000
    if (options.amount > 5000) {
      throw new BadRequestError('Cash on Delivery (COD) is available only for orders up to ₹5,000');
    }

    if (options.userRiskScore && options.userRiskScore > 70) {
      throw new BadRequestError('COD is not available for this account. Please select an online payment method.');
    }

    return {
      method: 'COD',
      orderId: options.orderId,
      amount: options.amount,
      currency: 'INR',
      status: 'PENDING',
      collectionStatus: 'PENDING_DELIVERY',
      instructions: 'Pay ₹' + options.amount.toFixed(2) + ' in cash or via on-the-spot UPI QR code upon arrival.',
    };
  }
}
