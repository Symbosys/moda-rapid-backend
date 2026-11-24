import { Request, Response } from 'express';
import { OrderService } from './order.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class OrderController {
  constructor(private readonly orderService: OrderService = new OrderService()) {}

  createOrder = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const result = await this.orderService.createOrder(userId, req.body);
    ApiResponse.success(res, result, 'Order created successfully', HttpStatus.CREATED);
  };

  getUserOrders = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const orders = await this.orderService.getUserOrders(userId);
    ApiResponse.success(res, orders, 'Orders fetched successfully', HttpStatus.OK);
  };

  getOrderDetails = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const orderId = req.params.id;
    const order = await this.orderService.getOrderById(orderId, userId);
    ApiResponse.success(res, order, 'Order details fetched successfully', HttpStatus.OK);
  };

  advanceOrderStatus = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const orderId = req.params.id;
    const { status } = req.body || {};
    const order = await this.orderService.advanceOrderStatus(orderId, userId, status);
    ApiResponse.success(res, order, `Order advanced to ${order.orderStatus}`, HttpStatus.OK);
  };

  cancelOrder = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const orderId = req.params.id;
    const order = await this.orderService.cancelOrder(orderId, userId, req.body);
    ApiResponse.success(res, order, 'Order cancelled successfully', HttpStatus.OK);
  };

  requestReturn = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const order = await this.orderService.requestReturn(userId, req.body);
    ApiResponse.success(res, order, 'Return requested successfully', HttpStatus.OK);
  };
}
