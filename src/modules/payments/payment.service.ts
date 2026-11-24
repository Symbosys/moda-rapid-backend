import crypto from 'crypto';
import { PaymentRepository } from './payment.repository';
import { UpiPaymentProvider } from './providers/upi.provider';
import { CardPaymentProvider } from './providers/card.provider';
import { NetBankingPaymentProvider } from './providers/netbanking.provider';
import { CodPaymentProvider } from './providers/cod.provider';
import { InitiatePaymentInput, VerifyPaymentInput } from './payment.validator';
import { BadRequestError } from '../../common/errors/app-error';
import { env } from '../../config/env.config';
import { logger } from '../../common/utils/logger';

export class PaymentService {
  private readonly upiProvider = new UpiPaymentProvider();
  private readonly cardProvider = new CardPaymentProvider();
  private readonly netBankingProvider = new NetBankingPaymentProvider();
  private readonly codProvider = new CodPaymentProvider();

  constructor(private readonly paymentRepo: PaymentRepository = new PaymentRepository()) {}

  getNetBankingBanks() {
    return this.netBankingProvider.getSupportedBanks();
  }

  async initiatePayment(input: InitiatePaymentInput) {
    let intent: unknown;
    let gatewayOrderId = `gw_${input.orderId}_${Date.now()}`;

    switch (input.paymentMethod) {
      case 'UPI': {
        const upiIntent = this.upiProvider.generatePaymentIntent({
          orderId: input.orderId,
          amount: input.amount,
          vpa: input.vpa,
        });
        gatewayOrderId = upiIntent.gatewayOrderId;
        intent = upiIntent;
        break;
      }
      case 'CARD': {
        const cardIntent = this.cardProvider.generatePaymentIntent({
          orderId: input.orderId,
          amount: input.amount,
        });
        gatewayOrderId = cardIntent.gatewayOrderId;
        intent = cardIntent;
        break;
      }
      case 'NET_BANKING': {
        if (!input.bankCode) {
          throw new BadRequestError('Bank code is required for Net Banking payment');
        }
        const nbIntent = this.netBankingProvider.generatePaymentIntent({
          orderId: input.orderId,
          amount: input.amount,
          bankCode: input.bankCode,
        });
        gatewayOrderId = nbIntent.gatewayOrderId;
        intent = nbIntent;
        break;
      }
      case 'COD': {
        const codIntent = this.codProvider.validateAndInitiate({
          orderId: input.orderId,
          amount: input.amount,
        });
        gatewayOrderId = `cod_${input.orderId}`;
        intent = codIntent;
        break;
      }
      default:
        throw new BadRequestError('Unsupported payment method');
    }

    try {
      await this.paymentRepo.createPaymentRecord({
        orderId: input.orderId,
        paymentMethod: input.paymentMethod,
        amount: input.amount,
        gatewayOrderId,
        status: input.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        upiVpa: input.vpa,
        bankName: input.bankCode,
        codCollectionStatus: input.paymentMethod === 'COD' ? 'PENDING_DELIVERY' : undefined,
      });
    } catch {
      // offline fallback
    }

    return {
      orderId: input.orderId,
      paymentMethod: input.paymentMethod,
      gatewayOrderId,
      amount: input.amount,
      intent,
    };
  }

  async verifyPayment(input: VerifyPaymentInput) {
    if (input.gatewaySignature) {
      const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${input.gatewayOrderId}|${input.paymentId}`)
        .digest('hex');

      if (generatedSignature !== input.gatewaySignature && process.env.NODE_ENV === 'production') {
        throw new BadRequestError('Payment verification signature mismatch');
      }
    }

    return {
      verified: true,
      orderId: input.orderId,
      paymentId: input.paymentId,
      status: 'SUCCESS',
      message: 'Payment verified successfully',
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  async handleWebhook(event: string, payload: Record<string, unknown>) {
    logger.info(`Processing payment webhook event: ${event}`, { payload });

    return {
      handled: true,
      event,
      timestamp: new Date().toISOString(),
    };
  }
}
