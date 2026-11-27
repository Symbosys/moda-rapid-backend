import { OrderService } from '../orders/order.service';

export interface TrackingDataResponse {
  orderId: string;
  orderStatus: string;
  currentStepIndex: number;
  placedAt: string;
  estimatedDeliveryMinutes: number;
  milestones: {
    status: string;
    label: string;
    stepIndex: number;
    isCompleted: boolean;
    isCurrent: boolean;
  }[];
  deliveryPartner: {
    name: string;
    phone: string;
    rating: number;
    vehicleNumber: string;
    avatar: string;
    currentLocation?: { latitude: number; longitude: number };
  } | null;
  deliveryAddress: {
    houseNo: string;
    area: string;
    city: string;
    pincode: string;
  };
  store: {
    name: string;
  };
}

export class TrackingService {
  constructor(private readonly orderService: OrderService = new OrderService()) {}

  async getTrackingStatus(orderId: string, userId: string): Promise<TrackingDataResponse> {
    const order = await this.orderService.getOrderById(orderId, userId, false);

    const milestoneSteps = [
      { status: 'ORDER_PLACED', label: 'Order Placed', stepIndex: 1 },
      { status: 'ORDER_ACCEPTED', label: 'Order Accepted by Shop', stepIndex: 2 },
      { status: 'PREPARING_ORDER', label: 'Preparing Your Order', stepIndex: 3 },
      { status: 'READY_FOR_PICKUP', label: 'Ready for Pickup', stepIndex: 4 },
      { status: 'PARTNER_ASSIGNED', label: 'Delivery Partner Assigned', stepIndex: 5 },
      { status: 'PICKED_UP', label: 'Picked Up', stepIndex: 6 },
      { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', stepIndex: 7 },
      { status: 'DELIVERED', label: 'Delivered', stepIndex: 8 },
    ];

    const currentStep = order.stepIndex;

    const milestones = milestoneSteps.map((m) => ({
      ...m,
      isCompleted: currentStep >= m.stepIndex,
      isCurrent: currentStep === m.stepIndex,
    }));

    return {
      orderId: order.id,
      orderStatus: order.orderStatus,
      currentStepIndex: currentStep,
      placedAt: order.placedAt,
      estimatedDeliveryMinutes: order.estimatedDeliveryMinutes,
      milestones,
      deliveryPartner: order.deliveryPartner ?? null,
      deliveryAddress: {
        houseNo: order.deliveryAddress.houseNo,
        area: order.deliveryAddress.area,
        city: order.deliveryAddress.city,
        pincode: order.deliveryAddress.pincode,
      },
      store: {
        name: order.shopName,
      },
    };
  }
}
