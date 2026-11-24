import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService = new NotificationService()) {}

  getNotifications = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId || 'anonymous';
    const notifications = await this.notificationService.getUserNotifications(userId);
    ApiResponse.success(res, notifications, 'Notifications fetched successfully', HttpStatus.OK);
  };
}
