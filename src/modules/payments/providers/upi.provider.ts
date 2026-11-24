export interface UpiInitiateOptions {
  orderId: string;
  amount: number;
  vpa?: string;
  merchantName?: string;
  merchantUpiId?: string;
}

export interface UpiPaymentIntent {
  method: 'UPI';
  gatewayOrderId: string;
  amount: number;
  currency: string;
  upiIntentLinks: {
    gpay: string;
    phonepe: string;
    paytm: string;
    bhim: string;
    universal: string;
  };
  dynamicQrPayload: string;
  vpaCollectStatus?: string;
}

export class UpiPaymentProvider {
  private readonly defaultVpa = 'modarapp@icici';
  private readonly merchantName = 'ModarApp StyleExpress';

  generatePaymentIntent(options: UpiInitiateOptions): UpiPaymentIntent {
    const merchantVpa = options.merchantUpiId || this.defaultVpa;
    const name = encodeURIComponent(options.merchantName || this.merchantName);
    const amountStr = options.amount.toFixed(2);
    const tr = options.orderId;

    // Standard NPCI UPI URI Specification
    const baseUri = `upi://pay?pa=${merchantVpa}&pn=${name}&tr=${tr}&am=${amountStr}&cu=INR&tn=Order%20Payment`;

    const gpay = `tez://upi/pay?pa=${merchantVpa}&pn=${name}&tr=${tr}&am=${amountStr}&cu=INR`;
    const phonepe = `phonepe://pay?pa=${merchantVpa}&pn=${name}&tr=${tr}&am=${amountStr}&cu=INR`;
    const paytm = `paytmmp://pay?pa=${merchantVpa}&pn=${name}&tr=${tr}&am=${amountStr}&cu=INR`;
    const bhim = `upi://pay?pa=${merchantVpa}&pn=${name}&tr=${tr}&am=${amountStr}&cu=INR`;

    return {
      method: 'UPI',
      gatewayOrderId: `upi_intent_${options.orderId}_${Date.now()}`,
      amount: options.amount,
      currency: 'INR',
      upiIntentLinks: {
        gpay,
        phonepe,
        paytm,
        bhim,
        universal: baseUri,
      },
      dynamicQrPayload: baseUri,
      vpaCollectStatus: options.vpa ? 'COLLECT_REQUEST_TRIGGERED' : undefined,
    };
  }
}
