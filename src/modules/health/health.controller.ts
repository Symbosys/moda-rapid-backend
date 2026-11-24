import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { ApiResponse } from '../../common/utils/response-formatter';

export class HealthController {
  static async getHealth(req: Request, res: Response): Promise<void> {
    let dbStatus = 'healthy';

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    const healthData = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
      service: 'ModarApp Monolithic Backend',
      version: '1.0.0',
    };

    ApiResponse.success(res, healthData, 'System is healthy');
  }
}
