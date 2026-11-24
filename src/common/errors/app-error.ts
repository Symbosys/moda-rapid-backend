import { HttpStatus, HttpStatusCode, ErrorCode } from '../constants/api-status';

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: string = ErrorCode.INTERNAL_ERROR,
    isOperational = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: unknown) {
    super(message, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, true, details);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', details?: unknown) {
    super(message, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, true, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details?: unknown) {
    super(message, HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', errorCode: string = ErrorCode.CONFLICT, details?: unknown) {
    super(message, HttpStatus.CONFLICT, errorCode, true, details);
  }
}

export class ShopConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.CONFLICT, ErrorCode.SHOP_CONFLICT, true, details);
  }
}
