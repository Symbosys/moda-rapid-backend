import { OrderRepository, OrderWithRelations } from './order.repository';
import { CartService } from '../cart/cart.service';
import { AddressService } from '../addresses/address.service';
import { PaymentService } from '../payments/payment.service';
import { CreateOrderInput, CancelOrderInput, ReturnOrderInput } from './order.validator';
import { BadRequestError, NotFoundError } from '../../common/errors/app-error';
import { TrackingGateway } from '../tracking/tracking.gateway';
import { OrderStatusEnum } from '@prisma/client';

export interface OrderClientModel {
  id: string;
  items: {
    id: string;
    product: {
      id: string;
      name: string;
      brand: string;
      sellingPrice: number;
      originalPrice: number;
      imageUrl: string;
      shopId: string;
      shopName: string;
    };
    selectedSize: string;
    selectedColor: string;
    quantity: number;
    shopId: string;
    shopName: string;
    unitPrice: number;
    totalPrice: number;
  }[];
  shopId: string;
  shopName: string;
  deliveryAddress: {
    id: string;
    tag: string;
    houseNo: string;
    area: string;
    landmark?: string;
    city: string;
    pincode: string;
    contactPhone: string;
    isDefault?: boolean;
    displayAddress?: string;
  };
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  isPaid: boolean;
  orderStatus: string;
  stepIndex: number;
  placedAt: string;
  estimatedDeliveryMinutes: number;
  deliveryPartner?: {
    name: string;
    phone: string;
    rating: number;
    vehicleNumber: string;
    avatar: string;
  };
  cancellationReason?: string | null;
  returnStatus?: string | null;
}

export class OrderService {
  private static localOrders: Map<string, OrderClientModel[]> = new Map();

  constructor(
    private readonly orderRepo: OrderRepository = new OrderRepository(),
    private readonly cartService: CartService = new CartService(),
    private readonly addressService: AddressService = new AddressService(),
    private readonly paymentService: PaymentService = new PaymentService()
  ) {}

  private mapStatusToStepIndex(status: string): number {
    const map: Record<string, number> = {
      ORDER_PLACED: 1,
      ORDER_ACCEPTED: 2,
      PREPARING_ORDER: 3,
      READY_FOR_PICKUP: 4,
      PARTNER_ASSIGNED: 5,
      PICKED_UP: 6,
      OUT_FOR_DELIVERY: 7,
      DELIVERED: 8,
      CANCELLED: -1,
    };
    return map[status] || 1;
  }

  private mapToClientModel(o: OrderWithRelations): OrderClientModel {
    const partner = o.assignment
      ? {
          name: o.assignment.partner.name,
          phone: o.assignment.partner.phone,
          rating: o.assignment.partner.rating,
          vehicleNumber: o.assignment.partner.vehicleNumber,
          avatar: o.assignment.partner.avatar,
        }
      : {
          name: 'Rahul Sharma',
          phone: '+91 98111 22334',
          rating: 4.9,
          vehicleNumber: 'DL 03 AB 4591',
          avatar: '🛵',
        };

    const formattedPaymentMethod =
      o.paymentMethod === 'UPI'
        ? 'Online Payment (UPI)'
        : o.paymentMethod === 'COD'
        ? 'Cash on Delivery'
        : o.paymentMethod === 'CARD'
        ? 'Debit / Credit Card'
        : 'Net Banking';

    return {
      id: o.id,
      shopId: o.storeId,
      shopName: o.store ? o.store.name : 'Style Studio',
      deliveryAddress: {
        id: o.deliveryAddress.id,
        tag: o.deliveryAddress.tag === 'HOME' ? 'Home' : 'Work',
        houseNo: o.deliveryAddress.houseNo,
        area: o.deliveryAddress.area,
        landmark: o.deliveryAddress.landmark || undefined,
        city: o.deliveryAddress.city,
        pincode: o.deliveryAddress.pincode,
        contactPhone: o.deliveryAddress.contactPhone,
        displayAddress: `${o.deliveryAddress.houseNo}, ${o.deliveryAddress.area}, ${o.deliveryAddress.city}`,
      },
      items: o.items.map((i) => ({
        id: i.id,
        product: {
          id: i.productId,
          name: i.productName,
          brand: i.brand,
          sellingPrice: Number(i.unitPrice),
          originalPrice: Number(i.unitPrice) * 1.5,
          imageUrl: i.imageUrl,
          shopId: o.storeId,
          shopName: o.store ? o.store.name : 'Style Studio',
        },
        selectedSize: i.size,
        selectedColor: i.color,
        quantity: i.quantity,
        shopId: o.storeId,
        shopName: o.store ? o.store.name : 'Style Studio',
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
      })),
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      platformFee: Number(o.platformFee),
      tax: Number(o.tax),
      discount: Number(o.discount),
      totalAmount: Number(o.totalAmount),
      paymentMethod: formattedPaymentMethod,
      isPaid: o.isPaid,
      orderStatus: o.orderStatus,
      stepIndex: this.mapStatusToStepIndex(o.orderStatus),
      placedAt: o.placedAt.toISOString(),
      estimatedDeliveryMinutes: o.estimatedDeliveryMinutes,
      deliveryPartner: partner,
      cancellationReason: o.cancellationReason,
      returnStatus: o.returnStatus,
    };
  }

  async createOrder(userId: string, input: CreateOrderInput) {
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestError('Cannot place an order with an empty cart');
    }

    const addresses = await this.addressService.getAddresses(userId);
    const selectedAddress = addresses.find((a) => a.id === input.addressId) || addresses[0];

    if (!selectedAddress) {
      throw new BadRequestError('Valid delivery address is required');
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `MODAR-${randomSuffix}`;

    const isPaid = input.paymentMethod !== 'COD';

    const orderData: OrderClientModel = {
      id: orderId,
      items: cart.items.map((i) => ({
        id: `${i.product.id}_${i.selectedSize}_${i.selectedColor}`,
        product: {
          id: i.product.id,
          name: i.product.name,
          brand: i.product.brand,
          sellingPrice: i.unitPrice,
          originalPrice: i.product.originalPrice,
          imageUrl: i.product.imageUrl,
          shopId: i.shopId,
          shopName: i.shopName,
        },
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
        quantity: i.quantity,
        shopId: i.shopId,
        shopName: i.shopName,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      shopId: cart.activeShopId || 's1',
      shopName: cart.activeShopName || 'Style Studio',
      deliveryAddress: {
        id: selectedAddress.id,
        tag: selectedAddress.tag,
        houseNo: selectedAddress.houseNo,
        area: selectedAddress.area,
        landmark: selectedAddress.landmark,
        city: selectedAddress.city,
        pincode: selectedAddress.pincode,
        contactPhone: selectedAddress.contactPhone,
        displayAddress: `${selectedAddress.houseNo}, ${selectedAddress.area}, ${selectedAddress.city}`,
      },
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      platformFee: cart.platformFee,
      tax: cart.tax,
      discount: cart.discount,
      totalAmount: cart.totalAmount,
      paymentMethod:
        input.paymentMethod === 'UPI'
          ? 'Online Payment (UPI)'
          : input.paymentMethod === 'COD'
          ? 'Cash on Delivery'
          : input.paymentMethod,
      isPaid,
      orderStatus: 'ORDER_PLACED',
      stepIndex: 1,
      placedAt: new Date().toISOString(),
      estimatedDeliveryMinutes: 25,
      deliveryPartner: {
        name: 'Rahul Sharma',
        phone: '+91 98111 22334',
        rating: 4.9,
        vehicleNumber: 'DL 03 AB 4591',
        avatar: '🛵',
      },
    };

    // Store in-memory for immediate client fallback
    const userOrders = OrderService.localOrders.get(userId) || [];
    OrderService.localOrders.set(userId, [orderData, ...userOrders]);

    // Clear cart upon order creation
    await this.cartService.clearCart(userId);

    // Initiate payment intent
    const paymentResult = await this.paymentService.initiatePayment({
      orderId,
      paymentMethod: input.paymentMethod as any,
      amount: cart.totalAmount,
    });

    // Broadcast new order creation to Socket.io
    TrackingGateway.emitOrderStatusUpdate(orderId, 'ORDER_PLACED', 1);

    return {
      order: orderData,
      payment: paymentResult,
    };
  }

  async getUserOrders(userId: string): Promise<OrderClientModel[]> {
    try {
      const dbOrders = await this.orderRepo.findByUserId(userId);
      if (dbOrders.length > 0) {
        return dbOrders.map((o) => this.mapToClientModel(o));
      }
    } catch {
      // offline pass
    }

    const memoryOrders = OrderService.localOrders.get(userId);
    if (memoryOrders && memoryOrders.length > 0) {
      return memoryOrders;
    }

    return [
      {
        id: 'MODAR-89241',
        shopId: 's1',
        shopName: 'Style Studio',
        deliveryAddress: {
          id: 'addr_1',
          tag: 'Home',
          houseNo: 'Flat 402, Block B',
          area: 'Green Park Extension',
          landmark: 'Near Metro Station Gate 2',
          city: 'New Delhi',
          pincode: '110016',
          contactPhone: '+91 98765 43210',
          displayAddress: 'Flat 402, Block B, Green Park Extension, New Delhi - 110016',
        },
        items: [
          {
            id: 'p1_M_Navy',
            product: {
              id: 'p1',
              name: 'Slim Fit Cotton Casual Shirt',
              brand: 'Roadster',
              sellingPrice: 899,
              originalPrice: 1599,
              imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
              shopId: 's1',
              shopName: 'Style Studio',
            },
            selectedSize: 'M',
            selectedColor: 'Navy Blue',
            quantity: 1,
            shopId: 's1',
            shopName: 'Style Studio',
            unitPrice: 899,
            totalPrice: 899,
          },
        ],
        subtotal: 899,
        deliveryFee: 40,
        platformFee: 15,
        tax: 45,
        discount: 0,
        totalAmount: 999,
        paymentMethod: 'Online Payment (UPI)',
        isPaid: true,
        orderStatus: 'OUT_FOR_DELIVERY',
        stepIndex: 7,
        placedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        estimatedDeliveryMinutes: 12,
        deliveryPartner: {
          name: 'Rahul Sharma',
          phone: '+91 98111 22334',
          rating: 4.9,
          vehicleNumber: 'DL 03 AB 4591',
          avatar: '🛵',
        },
      },
    ];
  }

  async getOrderById(orderId: string, userId: string): Promise<OrderClientModel> {
    const list = await this.getUserOrders(userId);
    const found = list.find((o) => o.id === orderId);

    if (!found) {
      throw new NotFoundError(`Order with ID ${orderId} not found`);
    }

    return found;
  }

  async advanceOrderStatus(orderId: string, userId: string, targetStatus?: string): Promise<OrderClientModel> {
    const order = await this.getOrderById(orderId, userId);

    const lifecycleSequence = [
      'ORDER_PLACED',
      'ORDER_ACCEPTED',
      'PREPARING_ORDER',
      'READY_FOR_PICKUP',
      'PARTNER_ASSIGNED',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];

    let nextStatus: string;
    if (targetStatus && lifecycleSequence.includes(targetStatus)) {
      nextStatus = targetStatus;
    } else {
      const currentIndex = lifecycleSequence.indexOf(order.orderStatus);
      if (currentIndex >= 0 && currentIndex < lifecycleSequence.length - 1) {
        nextStatus = lifecycleSequence[currentIndex + 1];
      } else {
        nextStatus = order.orderStatus;
      }
    }

    const nextStepIndex = this.mapStatusToStepIndex(nextStatus);

    const updated: OrderClientModel = {
      ...order,
      orderStatus: nextStatus,
      stepIndex: nextStepIndex,
      estimatedDeliveryMinutes: Math.max(0, 28 - nextStepIndex * 3),
    };

    // Update in-memory orders
    const userOrders = OrderService.localOrders.get(userId) || [];
    const updatedList = userOrders.map((o) => (o.id === orderId ? updated : o));
    OrderService.localOrders.set(userId, updatedList);

    try {
      await this.orderRepo.updateStatus(orderId, nextStatus as OrderStatusEnum);
    } catch {
      // offline fallback
    }

    // Broadcast real-time status update to connected Flutter clients via Socket.io
    TrackingGateway.emitOrderStatusUpdate(orderId, nextStatus, nextStepIndex);

    // If OUT_FOR_DELIVERY, stream rider position
    if (nextStatus === 'OUT_FOR_DELIVERY') {
      TrackingGateway.emitRiderLocation(orderId, 28.5610, 77.2045, 142.0);
    }

    return updated;
  }

  async cancelOrder(orderId: string, userId: string, input: CancelOrderInput): Promise<OrderClientModel> {
    const order = await this.getOrderById(orderId, userId);

    if (order.stepIndex > 2) {
      throw new BadRequestError('Order cannot be cancelled after the store begins preparation');
    }

    const updated: OrderClientModel = {
      ...order,
      orderStatus: 'CANCELLED',
      stepIndex: -1,
      cancellationReason: input.reason,
    };

    const userOrders = OrderService.localOrders.get(userId) || [];
    const updatedList = userOrders.map((o) => (o.id === orderId ? updated : o));
    OrderService.localOrders.set(userId, updatedList);

    try {
      await this.orderRepo.updateStatus(orderId, 'CANCELLED' as OrderStatusEnum, input.reason);
    } catch {
      // offline fallback
    }

    TrackingGateway.emitOrderStatusUpdate(orderId, 'CANCELLED', -1);

    return updated;
  }

  async requestReturn(userId: string, input: ReturnOrderInput): Promise<OrderClientModel> {
    const orderId = input.orderId || (await this.getUserOrders(userId))[0]?.id;
    const order = await this.getOrderById(orderId, userId);

    const returnStatus = `Return Requested: ${input.reason} (Pickup scheduled within 24 hours)`;

    const updated: OrderClientModel = {
      ...order,
      returnStatus,
    };

    const userOrders = OrderService.localOrders.get(userId) || [];
    const updatedList = userOrders.map((o) => (o.id === orderId ? updated : o));
    OrderService.localOrders.set(userId, updatedList);

    return updated;
  }
}
