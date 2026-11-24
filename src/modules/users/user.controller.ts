import { Request, Response } from 'express';
import { UserService } from './user.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class UserController {
  constructor(private readonly userService: UserService = new UserService()) {}

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const profile = await this.userService.getProfile(userId);

    ApiResponse.success(res, profile, 'User profile fetched successfully', HttpStatus.OK);
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const updated = await this.userService.updateProfile(userId, req.body);

    ApiResponse.success(res, updated, 'Profile updated successfully', HttpStatus.OK);
  };
}
