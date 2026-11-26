import { Request, Response } from 'express';
import { VendorOrderService } from './order.service';
import { ApiResponse } from '../../../../common/utils/response-formatter';
import { HttpStatus } from '../../../../common/constants/api-status';

export class VendorOrderController {
  constructor(private readonly orderService: VendorOrderService = new VendorOrderService()) {}

  getStoreOrders = async (req: Request, res: Response): Promise<void> => {
    const storeId = (req.query.storeId as string) || 's1';
    const status = req.query.status as string | undefined;

    const orders = await this.orderService.getStoreOrders(storeId, status);
    ApiResponse.success(res, orders, 'Vendor store orders fetched successfully', HttpStatus.OK);
  };

  getOrderDetails = async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.id;
    const storeId = (req.query.storeId as string) || undefined;

    const order = await this.orderService.getOrderDetails(orderId, storeId);
    ApiResponse.success(res, order, 'Order details fetched successfully', HttpStatus.OK);
  };

  updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.id;
    const updated = await this.orderService.updateOrderStatus(orderId, req.body);
    ApiResponse.success(res, updated, 'Order status updated successfully', HttpStatus.OK);
  };
}
