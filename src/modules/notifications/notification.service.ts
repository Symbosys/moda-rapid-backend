export interface NotificationClientModel {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: string; // 'order', 'offer', 'system'
  orderId?: string;
}

export class NotificationService {
  async getUserNotifications(userId: string): Promise<NotificationClientModel[]> {
    return [
      {
        id: 'notif_1',
        title: 'Order Out for Delivery 🛵',
        message: 'Rahul Sharma is on the way with your fashion order (MODAR-89241). Estimated arrival in 12 mins.',
        time: '10 mins ago',
        isRead: false,
        type: 'order',
        orderId: 'MODAR-89241',
      },
      {
        id: 'notif_2',
        title: 'Festive Flash Sale Live! 🎉',
        message: 'Use coupon FESTIVE60 to enjoy 20% OFF up to ₹300 on trending designer wear.',
        time: '2 hours ago',
        isRead: true,
        type: 'offer',
      },
      {
        id: 'notif_3',
        title: 'Order Confirmed ✅',
        message: 'Style Studio has accepted and packed your order MODAR-89241.',
        time: '25 mins ago',
        isRead: true,
        type: 'order',
        orderId: 'MODAR-89241',
      },
    ];
  }
}
