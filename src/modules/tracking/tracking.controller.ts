import { Request, Response } from 'express';
import { TrackingService } from './tracking.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class TrackingController {
  constructor(private readonly trackingService: TrackingService = new TrackingService()) {}

  getTrackingStatus = async (req: Request, res: Response): Promise<void> => {
    const orderId = req.params.orderId;
    const userId = req.user?.userId || 'anonymous';
    const trackingData = await this.trackingService.getTrackingStatus(orderId, userId);

    ApiResponse.success(res, trackingData, 'Tracking status fetched successfully', HttpStatus.OK);
  };
}
