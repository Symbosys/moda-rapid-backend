import { Request, Response } from 'express';
import { StoreService } from './store.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class StoreController {
  constructor(private readonly storeService: StoreService = new StoreService()) {}

  getNearbyStores = async (req: Request, res: Response): Promise<void> => {
    // req.query is already parsed by validateRequest
    const query = req.query as unknown as { lat: number; lng: number; radius: number };
    const stores = await this.storeService.getNearbyStores(query);

    ApiResponse.success(res, stores, 'Nearby stores fetched successfully', HttpStatus.OK);
  };

  getStoreDetails = async (req: Request, res: Response): Promise<void> => {
    const store = await this.storeService.getStoreById(req.params.id);
    ApiResponse.success(res, store, 'Store details fetched successfully', HttpStatus.OK);
  };
}
