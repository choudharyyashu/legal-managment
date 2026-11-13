import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  next(
    AppError.notFound(
      `Route '${req.method} ${req.originalUrl || req.url}'`,
      'ROUTE_NOT_FOUND'
    )
  );
}

