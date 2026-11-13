import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const isOperational = err instanceof AppError && err.isOperational;
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorCode = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const details = err instanceof AppError ? err.details : undefined;

  // Log error with request context
  const errorMeta: Record<string, unknown> = {
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip,
    statusCode,
    errorCode,
  };

  if (!isOperational) {
    logger.error(`Unhandled Exception: ${err.message}`, {
      ...errorMeta,
      stack: err.stack,
    });
  } else {
    logger.warn(`Operational Error: ${err.message}`, errorMeta);
  }

  // Consistent API error response envelope
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: isOperational || process.env.NODE_ENV !== 'production'
        ? err.message
        : 'An unexpected internal error occurred. Please contact support.',
      ...(details ? { details } : {}),
      ...(process.env.NODE_ENV === 'development' && !isOperational ? { stack: err.stack } : {}),
    },
  });
}

