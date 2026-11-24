import { Request, Response } from 'express';
import { LocationService } from './location.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class LocationController {
  constructor(private readonly locationService: LocationService = new LocationService()) {}

  checkServiceability = async (req: Request, res: Response): Promise<void> => {
    const result = await this.locationService.checkServiceability(req.body);
    ApiResponse.success(res, result, 'Serviceability checked successfully', HttpStatus.OK);
  };

  reverseGeocode = async (req: Request, res: Response): Promise<void> => {
    const result = await this.locationService.reverseGeocode(req.body);
    ApiResponse.success(res, result, 'Reverse geocode resolved successfully', HttpStatus.OK);
  };
}
