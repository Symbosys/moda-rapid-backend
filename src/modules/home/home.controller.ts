import { Request, Response } from 'express';
import { HomeService } from './home.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class HomeController {
  constructor(private readonly homeService: HomeService = new HomeService()) {}

  getBanners = async (req: Request, res: Response): Promise<void> => {
    const banners = this.homeService.getBanners();
    ApiResponse.success(res, banners, 'Promotional banners fetched successfully', HttpStatus.OK);
  };

  getHomeFeed = async (req: Request, res: Response): Promise<void> => {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : 28.5584;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : 77.2023;

    const feed = await this.homeService.getHomeFeed(lat, lng);
    ApiResponse.success(res, feed, 'Home feed aggregated successfully', HttpStatus.OK);
  };
}
