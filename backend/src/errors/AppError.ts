/**
 * Custom operational error class for Heugly & Bludworth Legal Practice Management API.
 * Distinguishes expected operational errors from unhandled programmer exceptions.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code: string = 'BAD_REQUEST', details?: unknown): AppError {
    return new AppError(message, 400, code, details);
  }

  static unauthorized(message: string = 'Authentication required', code: string = 'UNAUTHORIZED'): AppError {
    return new AppError(message, 401, code);
  }

  static forbidden(message: string = 'Access denied: insufficient permissions', code: string = 'FORBIDDEN'): AppError {
    return new AppError(message, 403, code);
  }

  static notFound(resource: string = 'Resource', code: string = 'NOT_FOUND'): AppError {
    return new AppError(`${resource} not found`, 404, code);
  }

  static conflict(message: string, code: string = 'CONFLICT'): AppError {
    return new AppError(message, 409, code);
  }

  static unprocessable(message: string, details?: unknown, code: string = 'VALIDATION_ERROR'): AppError {
    return new AppError(message, 422, code, details);
  }

  static internal(message: string = 'An unexpected internal error occurred', code: string = 'INTERNAL_SERVER_ERROR'): AppError {
    return new AppError(message, 500, code);
  }
}

