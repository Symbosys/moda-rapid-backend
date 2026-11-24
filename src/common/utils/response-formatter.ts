import { Response } from 'express';
import { HttpStatus, HttpStatusCode } from '../constants/api-status';

export interface ApiResponseOptions<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data?: T,
    message = 'Success',
    statusCode: HttpStatusCode = HttpStatus.OK,
    meta?: Record<string, unknown>
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode: HttpStatusCode = HttpStatus.BAD_REQUEST,
    errorCode = 'BAD_REQUEST',
    details?: unknown
  ): Response {
    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details ? { details } : {}),
      },
    });
  }
}
