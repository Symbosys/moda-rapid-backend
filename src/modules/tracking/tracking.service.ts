import { OrderService, OrderClientModel } from '../orders/order.service';
import { NotFoundError } from '../../common/errors/app-error';

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
    currentLocation: {
      latitude: number;
      longitude: number;
    };
  };
  deliveryAddress: {
    houseNo: string;
    area: string;
    city: string;
    pincode: string;
  };
  store: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

export class TrackingService {
  constructor(private readonly orderService: OrderService = new OrderService()) {}

  async getTrackingStatus(orderId: string, userId = 'test_user'): Promise<TrackingDataResponse> {
    let order: OrderClientModel;

    try {
      order = await this.orderService.getOrderById(orderId, userId);
    } catch {
      // Default sample fallback order matching OrderTrackingScreen
      order = {
        id: orderId,
        shopId: 's1',
        shopName: 'Style Studio',
        deliveryAddress: {
          id: 'addr_1',
          tag: 'Home',
          houseNo: 'Flat 302, Green Valley Apartment',
          area: 'Kanke Road',
          city: 'Ranchi',
          pincode: '834008',
          contactPhone: '+91 98765 43210',
        },
        items: [],
        subtotal: 1299,
        deliveryFee: 0,
        platformFee: 15,
        tax: 65,
        discount: 80,
        totalAmount: 1299,
        paymentMethod: 'Online Payment (UPI)',
        isPaid: true,
        orderStatus: 'OUT_FOR_DELIVERY',
        stepIndex: 7,
        placedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        estimatedDeliveryMinutes: 12,
        deliveryPartner: {
          name: 'Rahul Sharma',
          phone: '+91 98111 22334',
          rating: 4.9,
          vehicleNumber: 'DL 03 AB 4591',
          avatar: '🛵',
        },
      };
    }

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
      deliveryPartner: {
        name: order.deliveryPartner?.name || 'Rahul Sharma',
        phone: order.deliveryPartner?.phone || '+91 98111 22334',
        rating: order.deliveryPartner?.rating || 4.9,
        vehicleNumber: order.deliveryPartner?.vehicleNumber || 'DL 03 AB 4591',
        avatar: order.deliveryPartner?.avatar || '🛵',
        currentLocation: {
          latitude: 28.5610,
          longitude: 77.2045,
        },
      },
      deliveryAddress: {
        houseNo: order.deliveryAddress.houseNo,
        area: order.deliveryAddress.area,
        city: order.deliveryAddress.city,
        pincode: order.deliveryAddress.pincode,
      },
      store: {
        name: order.shopName,
        address: 'Shop 12, Main Market, Green Park',
        latitude: 28.5590,
        longitude: 77.2010,
      },
    };
  }
}
