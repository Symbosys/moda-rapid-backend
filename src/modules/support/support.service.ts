export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export class SupportService {
  getFaqs(): FaqItem[] {
    return [
      {
        id: 'faq_1',
        category: 'Delivery',
        question: 'How does 30-minute delivery work?',
        answer: 'We partner with premium local clothing stores within a 5-8 km radius. Once you place an order, the store immediately packs it and our nearby delivery partner picks it up and delivers it to your doorstep within ~30 minutes.',
      },
      {
        id: 'faq_2',
        category: 'Returns & Exchange',
        question: 'What is your return and trial policy?',
        answer: 'We offer an easy 24-hour return and exchange window. If the size or fit is not right, simply request a return from the Orders screen and our delivery partner will pick it up.',
      },
      {
        id: 'faq_3',
        category: 'Payments',
        question: 'Which payment methods are supported?',
        answer: 'We support UPI (Google Pay, PhonePe, Paytm, QR), Debit & Credit Cards (Visa, MasterCard, RuPay), Net Banking (50+ banks), and Cash on Delivery (COD) for orders up to ₹5,000.',
      },
      {
        id: 'faq_4',
        category: 'Orders',
        question: 'Why can I only order from one store at a time?',
        answer: 'To guarantee our 30-minute express delivery promise, each order is fulfilled and dispatched from a single local store partner.',
      },
    ];
  }
}
