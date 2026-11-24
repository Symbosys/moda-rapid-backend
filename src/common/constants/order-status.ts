// Order Status lifecycle mappings matching Flutter OrderStatus enum
export const OrderStatus = {
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_ACCEPTED: 'ORDER_ACCEPTED',
  PREPARING_ORDER: 'PREPARING_ORDER',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  PARTNER_ASSIGNED: 'PARTNER_ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderStatusStepMap: Record<OrderStatusType, { label: string; stepIndex: number }> = {
  [OrderStatus.ORDER_PLACED]: { label: 'Order Placed', stepIndex: 1 },
  [OrderStatus.ORDER_ACCEPTED]: { label: 'Order Accepted by Shop', stepIndex: 2 },
  [OrderStatus.PREPARING_ORDER]: { label: 'Preparing Your Order', stepIndex: 3 },
  [OrderStatus.READY_FOR_PICKUP]: { label: 'Ready for Pickup', stepIndex: 4 },
  [OrderStatus.PARTNER_ASSIGNED]: { label: 'Delivery Partner Assigned', stepIndex: 5 },
  [OrderStatus.PICKED_UP]: { label: 'Picked Up', stepIndex: 6 },
  [OrderStatus.OUT_FOR_DELIVERY]: { label: 'Out for Delivery', stepIndex: 7 },
  [OrderStatus.DELIVERED]: { label: 'Delivered', stepIndex: 8 },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', stepIndex: -1 },
};
