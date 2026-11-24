export interface BankDetail {
  code: string;
  name: string;
  isPopular: boolean;
  logoUrl?: string;
}

export interface NetBankingInitiateOptions {
  orderId: string;
  amount: number;
  bankCode: string;
}

export interface NetBankingPaymentIntent {
  method: 'NET_BANKING';
  gatewayOrderId: string;
  amount: number;
  currency: string;
  bankCode: string;
  redirectUrl: string;
}

export class NetBankingPaymentProvider {
  private readonly popularBanks: BankDetail[] = [
    { code: 'HDFC', name: 'HDFC Bank', isPopular: true },
    { code: 'SBIN', name: 'State Bank of India', isPopular: true },
    { code: 'ICIC', name: 'ICICI Bank', isPopular: true },
    { code: 'UTIB', name: 'Axis Bank', isPopular: true },
    { code: 'KKBK', name: 'Kotak Mahindra Bank', isPopular: true },
    { code: 'PUNB', name: 'Punjab National Bank', isPopular: true },
    { code: 'BARB', name: 'Bank of Baroda', isPopular: false },
    { code: 'IDFB', name: 'IDFC FIRST Bank', isPopular: false },
    { code: 'YESB', name: 'Yes Bank', isPopular: false },
    { code: 'INDB', name: 'IndusInd Bank', isPopular: false },
  ];

  getSupportedBanks(): BankDetail[] {
    return this.popularBanks;
  }

  generatePaymentIntent(options: NetBankingInitiateOptions): NetBankingPaymentIntent {
    const gatewayOrderId = `order_nb_${options.orderId}_${Date.now()}`;
    const redirectUrl = `https://api.modarfashion.com/v1/payments/netbanking/redirect?gatewayOrderId=${gatewayOrderId}&bank=${options.bankCode}`;

    return {
      method: 'NET_BANKING',
      gatewayOrderId,
      amount: options.amount,
      currency: 'INR',
      bankCode: options.bankCode,
      redirectUrl,
    };
  }
}
