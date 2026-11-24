export interface CardInitiateOptions {
  orderId: string;
  amount: number;
  cardNumber?: string;
}

export interface CardPaymentIntent {
  method: 'CARD';
  gatewayOrderId: string;
  amount: number;
  currency: string;
  supportedNetworks: string[];
  requires3DSecure: boolean;
  checkoutSessionUrl: string;
}

export class CardPaymentProvider {
  generatePaymentIntent(options: CardInitiateOptions): CardPaymentIntent {
    const gatewayOrderId = `order_card_${options.orderId}_${Date.now()}`;

    return {
      method: 'CARD',
      gatewayOrderId,
      amount: options.amount,
      currency: 'INR',
      supportedNetworks: ['VISA', 'MASTERCARD', 'RUPAY', 'AMEX'],
      requires3DSecure: true,
      checkoutSessionUrl: `https://api.modarfashion.com/v1/payments/3ds/session/${gatewayOrderId}`,
    };
  }

  detectNetwork(cardNumber: string): string {
    const clean = cardNumber.replace(/\D/g, '');
    if (/^4/.test(clean)) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
    if (/^6(0|5)/.test(clean)) return 'RUPAY';
    if (/^3[47]/.test(clean)) return 'AMEX';
    return 'OTHER';
  }
}
