import { Request, Response } from 'express';
import { VendorStoreService } from './store.service';
import { ApiResponse } from '../../../../common/utils/response-formatter';
import { HttpStatus } from '../../../../common/constants/api-status';

export class VendorStoreController {
  constructor(private readonly storeService: VendorStoreService = new VendorStoreService()) {}

  createStore = async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.user?.userId || 'usr_vendor_default';
    const store = await this.storeService.createStore(vendorId, req.body);
    ApiResponse.success(res, store, 'Vendor store created successfully', HttpStatus.CREATED);
  };

  getMyStore = async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.user?.userId || 'usr_vendor_default';
    const storeId = (req.query.storeId as string) || undefined;
    const store = await this.storeService.getStoreByVendorId(vendorId, storeId);
    ApiResponse.success(res, store, 'Vendor store details fetched successfully', HttpStatus.OK);
  };

  updateStore = async (req: Request, res: Response): Promise<void> => {
    const storeId = req.params.id;
    const store = await this.storeService.updateStore(storeId, req.body);
    ApiResponse.success(res, store, 'Vendor store updated successfully', HttpStatus.OK);
  };

  toggleStoreStatus = async (req: Request, res: Response): Promise<void> => {
    const storeId = req.params.id;
    const { isOpen } = req.body;
    const store = await this.storeService.toggleStoreStatus(storeId, isOpen);
    ApiResponse.success(
      res,
      store,
      `Store is now ${isOpen ? 'OPEN' : 'CLOSED'} for orders`,
      HttpStatus.OK
    );
  };
}
